import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getOrganizationBillingDashboard } from "@/lib/sugent/customer-billing/customerPaymentProviderEngine";
import { getCreatorBillingDashboard } from "@/lib/sugent/billing/creatorBillingEngine";

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function makeApiKey() {
  const raw = `ocai_${crypto.randomBytes(24).toString("hex")}`;
  const keyPrefix = raw.slice(0, 12);

  return {
    raw,
    keyPrefix,
    keyHash: hashValue(raw),
  };
}

export async function getCustomerDashboardByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.customerUser.findUnique({
    where: { email: normalizedEmail },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
      },
      onboardingRuns: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      apiKeys: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Customer user not found.",
    };
  }

  const organizationIds = user.memberships.map((membership) => membership.organizationId);

  const organizations = await prisma.customerOrganization.findMany({
    where: {
      id: { in: organizationIds },
    },
    orderBy: { createdAt: "desc" },
  });

  const organizationDashboards = await Promise.all(
    organizations.map(async (organization) => {
      const billing = await getOrganizationBillingDashboard(organization.id);
      const creatorUsage = organization.companyId
        ? await getCreatorBillingDashboard(organization.companyId, organization.defaultWorkspaceId || null)
        : null;

      return {
        organization,
        membership: user.memberships.find((membership) => membership.organizationId === organization.id) || null,
        billing,
        creatorUsage,
      };
    })
  );

  return {
    ok: true,
    user,
    organizations,
    organizationDashboards,
    summary: {
      organizations: organizations.length,
      activeOrganizations: organizations.filter((org) => org.status === "active").length,
      onboardingRuns: user.onboardingRuns.length,
      apiKeys: user.apiKeys.length,
    },
  };
}

export async function getCustomerDashboardByOrganization(organizationId: string) {
  const organization = await prisma.customerOrganization.findUnique({
    where: { id: organizationId },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
      },
      onboardingRuns: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },

    },
  });

  if (!organization) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Customer organization not found.",
    };
  }

  const apiKeys = await prisma.customerApiKey.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const billing = await getOrganizationBillingDashboard(organizationId);
  const creatorUsage = organization.companyId
    ? await getCreatorBillingDashboard(organization.companyId, organization.defaultWorkspaceId || null)
    : null;

  return {
    ok: true,
    organization: {
      ...organization,
      apiKeys,
    },
    billing,
    creatorUsage,
    summary: {
      members: organization.memberships.length,
      onboardingRuns: organization.onboardingRuns.length,
      apiKeys: apiKeys.length,
      companyLinked: Boolean(organization.companyId),
      workspaceLinked: Boolean(organization.defaultWorkspaceId),
    },
  };
}

export async function updateCustomerProfile({
  userId,
  email,
  name,
  timezone,
  locale,
}: {
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  timezone?: string | null;
  locale?: string | null;
}) {
  if (!userId && !email) {
    return {
      ok: false,
      status: "BAD_REQUEST",
      reason: "userId or email is required.",
    };
  }

  const user = userId
    ? await prisma.customerUser.findUnique({ where: { id: userId } })
    : await prisma.customerUser.findUnique({ where: { email: String(email).trim().toLowerCase() } });

  if (!user) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Customer user not found.",
    };
  }

  const updated = await prisma.customerUser.update({
    where: { id: user.id },
    data: {
      name: name ?? user.name,
      timezone: timezone ?? user.timezone,
      locale: locale ?? user.locale,
      metadata: {
        ...(user.metadata as any || {}),
        profileUpdatedAt: new Date().toISOString(),
      },
    },
  });

  return {
    ok: true,
    user: updated,
  };
}

export async function updateCustomerOrganizationSettings({
  organizationId,
  name,
  status,
}: {
  organizationId: string;
  name?: string | null;
  status?: string | null;
}) {
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

  const updated = await prisma.customerOrganization.update({
    where: { id: organizationId },
    data: {
      name: name || organization.name,
      status: status || organization.status,
      metadata: {
        ...(organization.metadata as any || {}),
        settingsUpdatedAt: new Date().toISOString(),
      },
    },
  });

  return {
    ok: true,
    organization: updated,
  };
}

export async function createCustomerApiKey({
  organizationId,
  userId,
  name = "Default API Key",
  scopes,
}: {
  organizationId: string;
  userId?: string | null;
  name?: string;
  scopes?: any;
}) {
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

  const key = makeApiKey();

  const apiKey = await prisma.customerApiKey.create({
    data: {
      organizationId,
      userId: userId || organization.ownerUserId || null,
      name,
      keyPrefix: key.keyPrefix,
      keyHash: key.keyHash,
      status: "active",
      scopes: scopes || {
        organization: ["read"],
        projects: ["read"],
        exports: ["read"],
      },
      metadata: {
        source: "v4_phase63_api_key",
      },
    },
  });

  return {
    ok: true,
    apiKey,
    secret: key.raw,
    warning: "Copy this key now. It will not be shown again.",
  };
}

export async function revokeCustomerApiKey(apiKeyId: string) {
  const existing = await prisma.customerApiKey.findUnique({
    where: { id: apiKeyId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "API key not found.",
    };
  }

  const apiKey = await prisma.customerApiKey.update({
    where: { id: apiKeyId },
    data: {
      status: "revoked",
      metadata: {
        ...(existing.metadata as any || {}),
        revokedAt: new Date().toISOString(),
      },
    },
  });

  return {
    ok: true,
    apiKey,
  };
}
