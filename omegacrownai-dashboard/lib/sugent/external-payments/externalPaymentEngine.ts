import { prisma } from "@/lib/db";
import { upsertCustomerSubscription } from "@/lib/sugent/customer-billing/customerPaymentProviderEngine";
import { recordCustomerAdminAction } from "@/lib/sugent/customer-admin/customerAdminEngine";

const DEFAULT_PAYMENT_LINKS = [
  {
    provider: "square",
    planTier: "pro",
    mode: "live",
    label: "Pay with Square",
    paymentUrl: "https://square.link/u/VEalNxqW",
    amountCents: 0,
    currency: "usd",
    billingCycle: "manual",
    description: "OmegaCrownAI Square payment link.",
  },
  {
    provider: "swipesimple",
    planTier: "pro",
    mode: "live",
    label: "Pay with SwipeSimple",
    paymentUrl: "https://swipesimple.com/links/lnk_c8438cec197f6459717164e176cf89ea",
    amountCents: 0,
    currency: "usd",
    billingCycle: "manual",
    description: "OmegaCrownAI SwipeSimple payment link.",
  },
];

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://omegacrownai.com";
}

function normalizeProvider(provider?: string | null) {
  const value = String(provider || "square").toLowerCase();
  return ["square", "swipesimple", "manual"].includes(value) ? value : "square";
}

function normalizePlanTier(planTier?: string | null) {
  const value = String(planTier || "pro").toLowerCase();
  return ["free", "starter", "pro", "studio", "enterprise"].includes(value) ? value : "pro";
}

function makeReferenceCode(provider: string, organizationId: string) {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `OMEGA-${provider.toUpperCase()}-${organizationId.slice(-6).toUpperCase()}-${suffix}`;
}

export async function seedExternalPaymentLinks() {
  const links = [];

  for (const item of DEFAULT_PAYMENT_LINKS) {
    const existing = await prisma.externalPaymentLink.findFirst({
      where: {
        provider: item.provider,
        planTier: item.planTier,
        paymentUrl: item.paymentUrl,
      },
    });

    const saved = existing
      ? await prisma.externalPaymentLink.update({
          where: { id: existing.id },
          data: {
            ...item,
            status: "active",
            metadata: {
              source: "v5_phase73_seed",
              updatedAt: new Date().toISOString(),
            },
          },
        })
      : await prisma.externalPaymentLink.create({
          data: {
            ...item,
            status: "active",
            metadata: {
              source: "v5_phase73_seed",
            },
          },
        });

    links.push(saved);
  }

  return {
    ok: true,
    links,
  };
}

export async function upsertExternalPaymentLink({
  provider,
  planTier = "pro",
  mode = "live",
  label,
  paymentUrl,
  amountCents = 0,
  currency = "usd",
  billingCycle = "manual",
  description,
}: {
  provider: string;
  planTier?: string | null;
  mode?: string | null;
  label: string;
  paymentUrl: string;
  amountCents?: number;
  currency?: string;
  billingCycle?: string;
  description?: string | null;
}) {
  const normalizedProvider = normalizeProvider(provider);
  const normalizedPlan = normalizePlanTier(planTier);

  const existing = await prisma.externalPaymentLink.findFirst({
    where: {
      provider: normalizedProvider,
      planTier: normalizedPlan,
      paymentUrl,
    },
  });

  const data = {
    provider: normalizedProvider,
    planTier: normalizedPlan,
    mode: String(mode || "live"),
    label,
    paymentUrl,
    amountCents,
    currency,
    billingCycle,
    description: description || null,
    status: "active",
    metadata: {
      source: "v5_phase73_external_payment_link",
    },
  };

  const link = existing
    ? await prisma.externalPaymentLink.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.externalPaymentLink.create({ data });

  return {
    ok: true,
    link,
  };
}

export async function createExternalPaymentAttempt({
  organizationId,
  userId,
  companyId,
  provider,
  planTier = "pro",
}: {
  organizationId: string;
  userId?: string | null;
  companyId?: string | null;
  provider: string;
  planTier?: string | null;
}) {
  await seedExternalPaymentLinks();

  const normalizedProvider = normalizeProvider(provider);
  const normalizedPlan = normalizePlanTier(planTier);

  const paymentLink = await prisma.externalPaymentLink.findFirst({
    where: {
      provider: normalizedProvider,
      planTier: normalizedPlan,
      status: "active",
    },
    orderBy: { updatedAt: "desc" },
  }) || await prisma.externalPaymentLink.findFirst({
    where: {
      provider: normalizedProvider,
      status: "active",
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!paymentLink) {
    return {
      ok: false,
      status: "NO_PAYMENT_LINK",
      reason: `No active ${normalizedProvider} payment link found.`,
    };
  }

  const referenceCode = makeReferenceCode(normalizedProvider, organizationId);
  const returnUrl = `${appUrl()}/customer-org/${organizationId}/billing?payment_provider=${normalizedProvider}&reference=${referenceCode}`;

  const attempt = await prisma.externalPaymentAttempt.create({
    data: {
      organizationId,
      userId: userId || null,
      companyId: companyId || null,
      paymentLinkId: paymentLink.id,
      provider: normalizedProvider,
      planTier: normalizedPlan,
      mode: paymentLink.mode,
      status: "redirected",
      checkoutUrl: paymentLink.paymentUrl,
      returnUrl,
      referenceCode,
      amountCents: paymentLink.amountCents,
      currency: paymentLink.currency,
      metadata: {
        source: "v5_phase73_payment_attempt",
        note: "External payment links redirect out to Square/SwipeSimple. Payment confirmation is manual/admin-controlled unless provider webhooks are added later.",
      },
    },
  });

  await recordCustomerAdminAction({
    organizationId,
    userId,
    companyId,
    action: "EXTERNAL_PAYMENT_ATTEMPT_CREATED",
    entityType: "ExternalPaymentAttempt",
    entityId: attempt.id,
    severity: "info",
    afterJson: {
      provider: normalizedProvider,
      planTier: normalizedPlan,
      referenceCode,
      checkoutUrl: paymentLink.paymentUrl,
    },
  });

  return {
    ok: true,
    attempt,
    redirectUrl: paymentLink.paymentUrl,
  };
}

export async function confirmExternalPaymentAttempt({
  attemptId,
  status = "manually_confirmed",
  confirmedBy = "system-admin",
  subscriptionStatus = "manual_paid",
}: {
  attemptId: string;
  status?: string;
  confirmedBy?: string;
  subscriptionStatus?: string;
}) {
  const existing = await prisma.externalPaymentAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "External payment attempt not found.",
    };
  }

  const attempt = await prisma.externalPaymentAttempt.update({
    where: { id: attemptId },
    data: {
      status,
      paidAt: ["paid", "manually_confirmed"].includes(status) ? new Date() : existing.paidAt,
      confirmedBy,
      metadata: {
        ...(existing.metadata as any || {}),
        confirmedAt: new Date().toISOString(),
        confirmedBy,
      },
    },
  });

  const subscription = await upsertCustomerSubscription({
    organizationId: attempt.organizationId,
    companyId: attempt.companyId || null,
    provider: attempt.provider,
    planTier: attempt.planTier,
    billingCycle: "manual",
    status: subscriptionStatus,
    actorId: confirmedBy,
    actorType: "admin",
  });

  await recordCustomerAdminAction({
    adminUserId: confirmedBy,
    organizationId: attempt.organizationId,
    userId: attempt.userId,
    companyId: attempt.companyId,
    action: "EXTERNAL_PAYMENT_CONFIRMED",
    entityType: "ExternalPaymentAttempt",
    entityId: attempt.id,
    severity: "warning",
    beforeJson: existing,
    afterJson: attempt,
    metadata: {
      subscriptionId: subscription.subscription.id,
      provider: attempt.provider,
    },
  });

  return {
    ok: true,
    attempt,
    subscription: subscription.subscription,
  };
}

export async function getExternalPaymentsDashboard(organizationId?: string | null) {
  await seedExternalPaymentLinks();

  const attemptWhere = organizationId ? { organizationId } : {};

  const [links, attempts] = await Promise.all([
    prisma.externalPaymentLink.findMany({
      orderBy: [{ provider: "asc" }, { planTier: "asc" }, { updatedAt: "desc" }],
      take: 100,
    }),
    prisma.externalPaymentAttempt.findMany({
      where: attemptWhere,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  return {
    ok: true,
    links,
    attempts,
    summary: {
      links: links.length,
      activeLinks: links.filter((link) => link.status === "active").length,
      squareLinks: links.filter((link) => link.provider === "square").length,
      swipeSimpleLinks: links.filter((link) => link.provider === "swipesimple").length,
      attempts: attempts.length,
      redirected: attempts.filter((attempt) => attempt.status === "redirected").length,
      confirmed: attempts.filter((attempt) => ["paid", "manually_confirmed"].includes(attempt.status)).length,
      failed: attempts.filter((attempt) => attempt.status === "failed").length,
    },
  };
}
