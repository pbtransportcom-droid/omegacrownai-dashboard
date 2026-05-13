import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { validateProviderEnvironment } from "@/lib/sugent/provider-secrets/providerSecretsEngine";
import { upsertCustomerSubscription } from "@/lib/sugent/customer-billing/customerPaymentProviderEngine";
import { recordCustomerAdminAction } from "@/lib/sugent/customer-admin/customerAdminEngine";

const STRIPE_API_VERSION = "2024-06-20" as const;

const PLAN_PRICE_ENV: Record<string, string | undefined> = {
  free: process.env.STRIPE_PRICE_FREE,
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  studio: process.env.STRIPE_PRICE_STUDIO,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://omegacrownai.com";
}

function normalizeMode(mode?: string | null) {
  return String(mode || "test").toLowerCase() === "live" ? "live" : "test";
}

function normalizePlanTier(planTier?: string | null) {
  const tier = String(planTier || "pro").toLowerCase();
  return ["free", "starter", "pro", "studio", "enterprise"].includes(tier) ? tier : "pro";
}

function getStripeSecretKey(mode: string) {
  if (mode === "live") return process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
  return process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;
}

function getStripeWebhookSecret(mode: string) {
  if (mode === "live") return process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET;
  return process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET;
}

function getStripeClient(mode: string) {
  const key = getStripeSecretKey(mode);

  if (!key) {
    throw new Error(`Missing Stripe ${mode} secret key environment variable.`);
  }

  return new Stripe(key, {
    apiVersion: STRIPE_API_VERSION as any,
  });
}

function priceForPlan(planTier: string) {
  const envPrice = PLAN_PRICE_ENV[planTier];
  if (envPrice) return envPrice;

  const fallback: Record<string, string> = {
    starter: "price_phase72_starter_placeholder",
    pro: "price_phase72_pro_placeholder",
    studio: "price_phase72_studio_placeholder",
    enterprise: "price_phase72_enterprise_placeholder",
    free: "price_phase72_free_placeholder",
  };

  return fallback[planTier] || fallback.pro;
}

export function getStripeBillingPlanMap() {
  return ["free", "starter", "pro", "studio", "enterprise"].map((tier) => ({
    tier,
    priceId: priceForPlan(tier),
    configured: Boolean(PLAN_PRICE_ENV[tier]),
    mode: "test_guarded",
  }));
}

export async function assertStripeEnvironmentReady(mode = "test") {
  const normalizedMode = normalizeMode(mode);

  const validation = await validateProviderEnvironment({
    provider: "stripe",
    category: "payment",
    mode: normalizedMode,
  });

  if (!validation.ok && normalizedMode === "live") {
    return {
      ok: false,
      status: "STRIPE_ENVIRONMENT_NOT_READY",
      reason: "Stripe live environment is not ready.",
      validation,
    };
  }

  return {
    ok: true,
    validation,
  };
}

export async function createStripeCheckoutSession({
  organizationId,
  userId,
  companyId,
  email,
  name,
  planTier = "pro",
  mode = "test",
}: {
  organizationId: string;
  userId?: string | null;
  companyId?: string | null;
  email?: string | null;
  name?: string | null;
  planTier?: string | null;
  mode?: string | null;
}) {
  const normalizedMode = normalizeMode(mode);
  const normalizedPlan = normalizePlanTier(planTier);

  const guard = await assertStripeEnvironmentReady(normalizedMode);
  if (!guard.ok) return guard;

  if (normalizedMode === "live") {
    const liveValidation = guard.validation as any;
    if (liveValidation.missingSecrets?.length) {
      return {
        ok: false,
        status: "LIVE_BLOCKED",
        reason: "Stripe live checkout blocked until live secrets validate ready.",
        validation: liveValidation,
      };
    }
  }

  const stripe = getStripeClient(normalizedMode);
  const baseUrl = appUrl();
  const priceId = priceForPlan(normalizedPlan);

  const existingCustomer = await prisma.stripeBillingCustomer.findFirst({
    where: {
      organizationId,
      mode: normalizedMode,
    },
    orderBy: { createdAt: "desc" },
  });

  let stripeCustomerId = existingCustomer?.stripeCustomerId || null;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: email || undefined,
      name: name || undefined,
      metadata: {
        organizationId,
        userId: userId || "",
        companyId: companyId || "",
        source: "v5_phase72_checkout",
      },
    });

    stripeCustomerId = customer.id;

    await prisma.stripeBillingCustomer.create({
      data: {
        organizationId,
        userId: userId || null,
        companyId: companyId || null,
        stripeCustomerId,
        email: email || null,
        name: name || null,
        mode: normalizedMode,
        status: "active",
        metadata: {
          source: "v5_phase72_customer_create",
        },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/customer-org/${organizationId}/billing?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing?stripe=cancelled`,
    metadata: {
      organizationId,
      userId: userId || "",
      companyId: companyId || "",
      planTier: normalizedPlan,
      mode: normalizedMode,
      source: "v5_phase72_checkout",
    },
    subscription_data: {
      metadata: {
        organizationId,
        userId: userId || "",
        companyId: companyId || "",
        planTier: normalizedPlan,
        mode: normalizedMode,
      },
    },
  });

  const record = await prisma.stripeCheckoutSessionRecord.create({
    data: {
      organizationId,
      userId: userId || null,
      companyId: companyId || null,
      stripeSessionId: session.id,
      stripeCustomerId,
      planTier: normalizedPlan,
      mode: normalizedMode,
      status: "created",
      checkoutUrl: session.url,
      successUrl: `${baseUrl}/customer-org/${organizationId}/billing?stripe=success`,
      cancelUrl: `${baseUrl}/pricing?stripe=cancelled`,
      metadata: {
        priceId,
        source: "v5_phase72_checkout_session",
      },
    },
  });

  await recordCustomerAdminAction({
    organizationId,
    userId,
    companyId,
    action: "STRIPE_CHECKOUT_SESSION_CREATED",
    entityType: "StripeCheckoutSessionRecord",
    entityId: record.id,
    severity: normalizedMode === "live" ? "warning" : "info",
    afterJson: {
      sessionId: session.id,
      planTier: normalizedPlan,
      mode: normalizedMode,
      url: session.url,
    },
  });

  return {
    ok: true,
    checkoutUrl: session.url,
    sessionId: session.id,
    record,
  };
}

export async function createStripeCustomerPortalSession({
  organizationId,
  mode = "test",
}: {
  organizationId: string;
  mode?: string | null;
}) {
  const normalizedMode = normalizeMode(mode);
  const stripe = getStripeClient(normalizedMode);

  const customer = await prisma.stripeBillingCustomer.findFirst({
    where: {
      organizationId,
      mode: normalizedMode,
      status: "active",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!customer) {
    return {
      ok: false,
      status: "NO_STRIPE_CUSTOMER",
      reason: "No Stripe customer exists for this organization and mode.",
    };
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customer.stripeCustomerId,
    return_url: `${appUrl()}/customer-org/${organizationId}/billing`,
  });

  return {
    ok: true,
    url: portal.url,
    customer,
  };
}

export async function syncStripeSubscriptionFromObject({
  subscription,
  mode = "test",
}: {
  subscription: Stripe.Subscription;
  mode?: string;
}) {
  const subAny = subscription as any;
  const metadata = subAny.metadata || {};
  const organizationId = metadata.organizationId;
  const userId = metadata.userId || null;
  const companyId = metadata.companyId || null;
  const planTier = normalizePlanTier(metadata.planTier || "pro");

  if (!organizationId) {
    return {
      ok: false,
      status: "MISSING_ORGANIZATION",
      reason: "Stripe subscription metadata missing organizationId.",
    };
  }

  const item = subAny.items?.data?.[0];
  const priceId = item?.price?.id || null;
  const productId = typeof item?.price?.product === "string" ? item.price.product : item?.price?.product?.id || null;

  const saved = await prisma.stripeBillingSubscription.upsert({
    where: { stripeSubscriptionId: subAny.id },
    create: {
      organizationId,
      userId,
      companyId,
      stripeCustomerId: String(subAny.customer || ""),
      stripeSubscriptionId: subAny.id,
      stripePriceId: priceId,
      stripeProductId: productId,
      planTier,
      mode,
      status: subAny.status,
      currentPeriodStart: subAny.current_period_start ? new Date(subAny.current_period_start * 1000) : null,
      currentPeriodEnd: subAny.current_period_end ? new Date(subAny.current_period_end * 1000) : null,
      cancelAtPeriodEnd: subAny.cancel_at_period_end || false,
      cancelledAt: subAny.canceled_at ? new Date(subAny.canceled_at * 1000) : null,
      metadata: {
        source: "v5_phase72_subscription_sync",
      },
    },
    update: {
      stripeCustomerId: String(subAny.customer || ""),
      stripePriceId: priceId,
      stripeProductId: productId,
      planTier,
      mode,
      status: subAny.status,
      currentPeriodStart: subAny.current_period_start ? new Date(subAny.current_period_start * 1000) : null,
      currentPeriodEnd: subAny.current_period_end ? new Date(subAny.current_period_end * 1000) : null,
      cancelAtPeriodEnd: subAny.cancel_at_period_end || false,
      cancelledAt: subAny.canceled_at ? new Date(subAny.canceled_at * 1000) : null,
      metadata: {
        source: "v5_phase72_subscription_sync",
        syncedAt: new Date().toISOString(),
      },
    },
  });

  await upsertCustomerSubscription({
    organizationId,
    companyId,
    provider: "stripe",
    planTier,
    billingCycle: "monthly",
    status: subAny.status,
    actorId: "stripe-webhook",
    actorType: "system",
  });

  return {
    ok: true,
    subscription: saved,
  };
}

export async function handleStripeWebhookEvent({
  rawBody,
  signature,
  mode = "test",
}: {
  rawBody: string;
  signature: string | null;
  mode?: string | null;
}) {
  const normalizedMode = normalizeMode(mode);
  const stripe = getStripeClient(normalizedMode);
  const webhookSecret = getStripeWebhookSecret(normalizedMode);

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (error: any) {
    return {
      ok: false,
      status: "SIGNATURE_OR_PAYLOAD_INVALID",
      reason: error?.message || "Invalid Stripe webhook payload.",
    };
  }

  const existing = event.id
    ? await prisma.stripeBillingEvent.findUnique({
        where: { stripeEventId: event.id },
      })
    : null;

  if (existing) {
    return {
      ok: true,
      status: "DUPLICATE_IGNORED",
      event: existing,
    };
  }

  let organizationId: string | null = null;
  let userId: string | null = null;
  let companyId: string | null = null;
  let stripeCustomerId: string | null = null;
  let stripeSubscriptionId: string | null = null;
  let stripeCheckoutSessionId: string | null = null;
  let resultJson: any = {};

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        stripeCheckoutSessionId = session.id;
        stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;
        organizationId = session.metadata?.organizationId || null;
        userId = session.metadata?.userId || null;
        companyId = session.metadata?.companyId || null;

        await prisma.stripeCheckoutSessionRecord.updateMany({
          where: { stripeSessionId: session.id },
          data: {
            status: "completed",
            stripeCustomerId,
            metadata: {
              source: "v5_phase72_checkout_completed",
              completedAt: new Date().toISOString(),
            },
          },
        });

        resultJson = { checkoutCompleted: true };
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subAny = subscription as any;
        stripeSubscriptionId = subAny.id;
        stripeCustomerId = String(subAny.customer || "");
        const sync = await syncStripeSubscriptionFromObject({
          subscription,
          mode: normalizedMode,
        });
        const syncAny = sync as any;
        organizationId = syncAny.ok && syncAny.subscription ? syncAny.subscription.organizationId : null;
        userId = syncAny.ok && syncAny.subscription ? syncAny.subscription.userId : null;
        companyId = syncAny.ok && syncAny.subscription ? syncAny.subscription.companyId : null;
        resultJson = syncAny;
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceAny = invoice as any;
        stripeCustomerId = typeof invoiceAny.customer === "string" ? invoiceAny.customer : invoiceAny.customer?.id || null;
        stripeSubscriptionId = typeof invoiceAny.subscription === "string" ? invoiceAny.subscription : null;
        resultJson = {
          invoiceStatus: invoiceAny.status,
          paid: invoiceAny.paid,
        };
        break;
      }

      default:
        resultJson = {
          ignored: true,
          reason: "Unhandled Stripe event type.",
        };
    }

    const saved = await prisma.stripeBillingEvent.create({
      data: {
        organizationId,
        userId,
        companyId,
        stripeEventId: event.id,
        eventType: event.type,
        mode: normalizedMode,
        status: resultJson?.ignored ? "ignored" : "processed",
        stripeCustomerId,
        stripeSubscriptionId,
        stripeCheckoutSessionId,
        payloadJson: event as any,
        resultJson,
      },
    });

    return {
      ok: true,
      event: saved,
      resultJson,
    };
  } catch (error: any) {
    const saved = await prisma.stripeBillingEvent.create({
      data: {
        organizationId,
        userId,
        companyId,
        stripeEventId: event.id,
        eventType: event.type,
        mode: normalizedMode,
        status: "failed",
        stripeCustomerId,
        stripeSubscriptionId,
        stripeCheckoutSessionId,
        payloadJson: event as any,
        error: error?.message || "Stripe webhook failed.",
      },
    });

    return {
      ok: false,
      event: saved,
      error: saved.error,
    };
  }
}

export async function getStripeBillingDashboard(organizationId?: string | null) {
  const where = organizationId ? { organizationId } : {};

  const [customers, subscriptions, sessions, events] = await Promise.all([
    prisma.stripeBillingCustomer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.stripeBillingSubscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.stripeCheckoutSessionRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.stripeBillingEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    ok: true,
    plans: getStripeBillingPlanMap(),
    customers,
    subscriptions,
    sessions,
    events,
    summary: {
      customers: customers.length,
      subscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter((item) => ["active", "trialing"].includes(item.status)).length,
      sessions: sessions.length,
      completedSessions: sessions.filter((item) => item.status === "completed").length,
      events: events.length,
      failedEvents: events.filter((item) => item.status === "failed").length,
    },
  };
}

export async function enforceStripePlanAccess({
  organizationId,
  requiredTier = "pro",
}: {
  organizationId: string;
  requiredTier?: string;
}) {
  const order = ["free", "starter", "pro", "studio", "enterprise"];
  const requiredIndex = order.indexOf(normalizePlanTier(requiredTier));

  const subscription = await prisma.stripeBillingSubscription.findFirst({
    where: {
      organizationId,
      status: {
        in: ["active", "trialing"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) {
    return {
      ok: false,
      status: "NO_ACTIVE_STRIPE_SUBSCRIPTION",
      requiredTier,
    };
  }

  const currentIndex = order.indexOf(normalizePlanTier(subscription.planTier));
  const allowed = currentIndex >= requiredIndex;

  return {
    ok: allowed,
    status: allowed ? "ALLOWED" : "UPGRADE_REQUIRED",
    requiredTier,
    currentTier: subscription.planTier,
    subscription,
  };
}
