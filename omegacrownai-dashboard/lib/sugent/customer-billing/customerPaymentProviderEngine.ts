import { prisma } from "@/lib/db";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";
import { upsertCreatorBillingPlan } from "@/lib/sugent/billing/creatorBillingEngine";

const SUPPORTED_PROVIDERS = ["manual", "stripe", "square", "swipesimple"];
const SUPPORTED_PLAN_TIERS = ["free", "starter", "pro", "studio", "enterprise"];

function normalizeProvider(provider?: string | null) {
  const value = String(provider || "manual").toLowerCase();
  return SUPPORTED_PROVIDERS.includes(value) ? value : "manual";
}

function normalizePlanTier(planTier?: string | null) {
  const value = String(planTier || "starter").toLowerCase();
  return SUPPORTED_PLAN_TIERS.includes(value) ? value : "starter";
}

function amountForPlan(planTier: string, billingCycle: string) {
  if (planTier === "free") return 0;
  if (planTier === "starter") return billingCycle === "annual" ? 19000 : 1900;
  if (planTier === "pro") return billingCycle === "annual" ? 49000 : 4900;
  if (planTier === "studio") return billingCycle === "annual" ? 149000 : 14900;
  if (planTier === "enterprise") return 0;
  return 0;
}

export async function getOrCreateManualPaymentProvider({
  organizationId,
  companyId,
}: {
  organizationId: string;
  companyId?: string | null;
}) {
  const existing = await prisma.paymentProvider.findFirst({
    where: {
      organizationId,
      provider: "manual",
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing;

  return prisma.paymentProvider.create({
    data: {
      organizationId,
      companyId: companyId || null,
      provider: "manual",
      status: "connected",
      mode: "manual",
      displayName: "Manual Billing",
      connectedAt: new Date(),
      metadata: {
        source: "v4_phase62_manual_provider",
        paymentRequired: false,
      },
    },
  });
}

export async function upsertPaymentProvider({
  organizationId,
  companyId,
  provider,
  mode = "test",
  status = "connected",
  displayName,
  externalAccountId,
  credentialsJson,
  actorId = "system-owner",
  actorType = "system",
}: {
  organizationId: string;
  companyId?: string | null;
  provider?: string | null;
  mode?: string;
  status?: string;
  displayName?: string | null;
  externalAccountId?: string | null;
  credentialsJson?: any;
  actorId?: string | null;
  actorType?: string;
}) {
  const normalizedProvider = normalizeProvider(provider);

  const existing = await prisma.paymentProvider.findFirst({
    where: {
      organizationId,
      provider: normalizedProvider,
    },
    orderBy: { createdAt: "desc" },
  });

  const data = {
    companyId: companyId || null,
    provider: normalizedProvider,
    status,
    mode: normalizedProvider === "manual" ? "manual" : mode,
    displayName: displayName || `${normalizedProvider} billing`,
    externalAccountId: externalAccountId || null,
    credentialsJson: credentialsJson || undefined,
    connectedAt: status === "connected" ? new Date() : undefined,
    metadata: {
      source: "v4_phase62_payment_provider",
      optionalPayment: true,
    },
  };

  const paymentProvider = existing
    ? await prisma.paymentProvider.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.paymentProvider.create({
        data: {
          organizationId,
          ...data,
        },
      });

  await prisma.billingEvent.create({
    data: {
      organizationId,
      companyId: companyId || null,
      provider: normalizedProvider,
      eventType: "PAYMENT_PROVIDER_UPSERTED",
      status: "processed",
      payloadJson: {
        provider: normalizedProvider,
        mode: paymentProvider.mode,
        status: paymentProvider.status,
      },
      processedAt: new Date(),
    },
  });

  if (companyId) {
    await recordAuditEvent({
      companyId,
      workspaceId: null,
      projectId: null,
      actorId: actorId || "system-owner",
      actorType,
      action: "PAYMENT_PROVIDER_UPSERTED",
      entityType: "PaymentProvider",
      entityId: paymentProvider.id,
      severity: "info",
      metadata: {
        organizationId,
        provider: normalizedProvider,
        status: paymentProvider.status,
        mode: paymentProvider.mode,
      },
    });
  }

  return {
    ok: true,
    paymentProvider,
  };
}

export async function upsertCustomerSubscription({
  organizationId,
  companyId,
  paymentProviderId,
  provider = "manual",
  planTier = "starter",
  billingCycle = "monthly",
  status,
  actorId = "system-owner",
  actorType = "system",
}: {
  organizationId: string;
  companyId?: string | null;
  paymentProviderId?: string | null;
  provider?: string;
  planTier?: string;
  billingCycle?: string;
  status?: string;
  actorId?: string | null;
  actorType?: string;
}) {
  const normalizedProvider = normalizeProvider(provider);
  const normalizedPlanTier = normalizePlanTier(planTier);
  const normalizedStatus = status || (normalizedProvider === "manual" ? "manual" : "active");

  const existing = await prisma.customerSubscription.findFirst({
    where: {
      organizationId,
      status: {
        in: ["trialing", "active", "manual"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const amountCents = amountForPlan(normalizedPlanTier, billingCycle);

  const subscription = existing
    ? await prisma.customerSubscription.update({
        where: { id: existing.id },
        data: {
          companyId: companyId || existing.companyId || null,
          paymentProviderId: paymentProviderId || existing.paymentProviderId || null,
          provider: normalizedProvider,
          planTier: normalizedPlanTier,
          billingCycle,
          status: normalizedStatus,
          amountCents,
          metadata: {
            source: "v4_phase62_subscription_upsert",
            optionalPayment: true,
            updatedAt: new Date().toISOString(),
          },
        },
      })
    : await prisma.customerSubscription.create({
        data: {
          organizationId,
          companyId: companyId || null,
          paymentProviderId: paymentProviderId || null,
          provider: normalizedProvider,
          planTier: normalizedPlanTier,
          billingCycle,
          status: normalizedStatus,
          amountCents,
          currentPeriodStart: new Date(),
          metadata: {
            source: "v4_phase62_subscription_upsert",
            optionalPayment: true,
          },
        },
      });

  await prisma.billingEvent.create({
    data: {
      organizationId,
      companyId: companyId || null,
      provider: normalizedProvider,
      eventType: "SUBSCRIPTION_UPSERTED",
      status: "processed",
      subscriptionId: subscription.id,
      payloadJson: {
        planTier: normalizedPlanTier,
        billingCycle,
        status: normalizedStatus,
        amountCents,
      },
      processedAt: new Date(),
    },
  });

  if (companyId) {
    const creatorTier = normalizedPlanTier === "free" ? "starter" : normalizedPlanTier;

    await upsertCreatorBillingPlan({
      companyId,
      workspaceId: null,
      tier: creatorTier,
      createdBy: actorId || "system-owner",
    });

    await recordAuditEvent({
      companyId,
      workspaceId: null,
      projectId: null,
      actorId: actorId || "system-owner",
      actorType,
      action: "CUSTOMER_SUBSCRIPTION_UPSERTED",
      entityType: "CustomerSubscription",
      entityId: subscription.id,
      severity: "info",
      metadata: {
        organizationId,
        provider: normalizedProvider,
        planTier: normalizedPlanTier,
        billingCycle,
        status: normalizedStatus,
      },
    });
  }

  return {
    ok: true,
    subscription,
  };
}

export async function bootstrapOrganizationBilling({
  organizationId,
  companyId,
  planTier = "starter",
  paymentMode = "manual",
}: {
  organizationId: string;
  companyId?: string | null;
  planTier?: string | null;
  paymentMode?: string | null;
}) {
  const provider = normalizeProvider(paymentMode);
  const paymentProvider = provider === "manual"
    ? await getOrCreateManualPaymentProvider({ organizationId, companyId: companyId || null })
    : (await upsertPaymentProvider({
        organizationId,
        companyId: companyId || null,
        provider,
        mode: "test",
        status: "inactive",
        displayName: `${provider} billing`,
      })).paymentProvider;

  const subscriptionResult = await upsertCustomerSubscription({
    organizationId,
    companyId: companyId || null,
    paymentProviderId: paymentProvider.id,
    provider,
    planTier: normalizePlanTier(planTier),
    billingCycle: provider === "manual" ? "manual" : "monthly",
    status: provider === "manual" ? "manual" : "trialing",
  });

  return {
    ok: true,
    paymentProvider,
    subscription: subscriptionResult.subscription,
  };
}

export async function getOrganizationBillingDashboard(organizationId: string) {
  const organization = await prisma.customerOrganization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Customer organization not found.",
    };
  }

  const [paymentProviders, subscriptions, billingEvents] = await Promise.all([
    prisma.paymentProvider.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customerSubscription.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.billingEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    ok: true,
    organization,
    paymentProviders,
    subscriptions,
    billingEvents,
    summary: {
      providers: paymentProviders.length,
      connectedProviders: paymentProviders.filter((item) => item.status === "connected").length,
      activeSubscription: subscriptions.find((item) =>
        ["active", "trialing", "manual"].includes(item.status)
      ) || null,
      supportedProviders: SUPPORTED_PROVIDERS,
    },
  };
}
