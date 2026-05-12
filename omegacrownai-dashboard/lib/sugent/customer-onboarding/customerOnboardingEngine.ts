import crypto from "crypto";
import { prisma } from "@/lib/db";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";
import { getOrCreateCompanyBrandKit } from "@/lib/sugent/brand-kit/brandKitEngine";
import { getOrCreateCreatorBillingPlan } from "@/lib/sugent/billing/creatorBillingEngine";

function slugify(value: string) {
  const base = String(value || "customer")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

  return `${base || "customer"}-${Date.now()}`;
}

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function startCustomerOnboarding({
  email,
  name,
  organizationName,
  selectedPlanTier = "starter",
  paymentMode = "manual",
  password,
}: {
  email: string;
  name?: string | null;
  organizationName?: string | null;
  selectedPlanTier?: string;
  paymentMode?: string;
  password?: string | null;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const orgName = organizationName || `${name || normalizedEmail.split("@")[0]}'s Organization`;

  const user = await prisma.customerUser.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      name: name || null,
      emailVerified: false,
      status: "active",
      passwordHash: password ? hashValue(password) : null,
      metadata: {
        source: "v4_phase61_onboarding",
      },
    },
    update: {
      name: name || undefined,
      lastLoginAt: new Date(),
    },
  });

  await prisma.customerAuthProvider.upsert({
    where: {
      provider_providerAccountId: {
        provider: "email",
        providerAccountId: normalizedEmail,
      },
    },
    create: {
      userId: user.id,
      provider: "email",
      providerAccountId: normalizedEmail,
      metadata: {
        source: "v4_phase61_onboarding",
      },
    },
    update: {
      userId: user.id,
    },
  });

  const organization = await prisma.customerOrganization.create({
    data: {
      name: orgName,
      slug: slugify(orgName),
      status: "active",
      ownerUserId: user.id,
      onboardingStatus: "running",
      metadata: {
        source: "v4_phase61_onboarding",
      },
    },
  });

  await prisma.customerMembership.create({
    data: {
      userId: user.id,
      organizationId: organization.id,
      role: "owner",
      status: "active",
      acceptedAt: new Date(),
      metadata: {
        source: "v4_phase61_onboarding",
      },
    },
  });

  const onboarding = await prisma.customerOnboardingSession.create({
    data: {
      userId: user.id,
      organizationId: organization.id,
      status: "running",
      currentStep: "organization_created",
      selectedPlanTier,
      paymentMode,
      metadata: {
        source: "v4_phase61_onboarding",
      },
    },
  });

  await prisma.customerOnboardingEvent.create({
    data: {
      onboardingId: onboarding.id,
      organizationId: organization.id,
      userId: user.id,
      type: "ONBOARDING_STARTED",
      status: "recorded",
      message: "Customer onboarding started.",
      metadata: {
        selectedPlanTier,
        paymentMode,
      },
    },
  });

  return {
    ok: true,
    user,
    organization,
    onboarding,
  };
}

export async function completeCustomerOnboarding({
  onboardingId,
  companyId,
  workspaceId,
  starterProjectId,
}: {
  onboardingId: string;
  companyId?: string | null;
  workspaceId?: string | null;
  starterProjectId?: string | null;
}) {
  const onboarding = await prisma.customerOnboardingSession.findUniqueOrThrow({
    where: { id: onboardingId },
  });

  const organization = onboarding.organizationId
    ? await prisma.customerOrganization.findUnique({
        where: { id: onboarding.organizationId },
      })
    : null;

  if (!organization) {
    throw new Error("Onboarding organization not found.");
  }

  await prisma.customerOrganization.update({
    where: { id: organization.id },
    data: {
      companyId: companyId || organization.companyId || null,
      defaultWorkspaceId: workspaceId || organization.defaultWorkspaceId || null,
      onboardingStatus: "completed",
    },
  });

  const completed = await prisma.customerOnboardingSession.update({
    where: { id: onboardingId },
    data: {
      status: "completed",
      currentStep: "completed",
      companyId: companyId || null,
      workspaceId: workspaceId || null,
      starterProjectId: starterProjectId || null,
      completedAt: new Date(),
    },
  });

  if (companyId) {
    await getOrCreateCompanyBrandKit(companyId, workspaceId || null);
    await getOrCreateCreatorBillingPlan(companyId, workspaceId || null);

    await recordAuditEvent({
      companyId,
      workspaceId: workspaceId || null,
      projectId: starterProjectId || null,
      actorId: onboarding.userId || "customer-onboarding",
      actorType: "customer",
      action: "CUSTOMER_ONBOARDING_COMPLETED",
      entityType: "CustomerOnboardingSession",
      entityId: onboardingId,
      severity: "info",
      metadata: {
        organizationId: organization.id,
        selectedPlanTier: onboarding.selectedPlanTier,
        paymentMode: onboarding.paymentMode,
      },
    });
  }

  await prisma.customerOnboardingEvent.create({
    data: {
      onboardingId,
      organizationId: organization.id,
      userId: onboarding.userId,
      type: "ONBOARDING_COMPLETED",
      status: "recorded",
      message: "Customer onboarding completed.",
      metadata: {
        companyId,
        workspaceId,
        starterProjectId,
      },
    },
  });

  return {
    ok: true,
    onboarding: completed,
  };
}

export async function getCustomerOnboardingStatus(onboardingId: string) {
  const onboarding = await prisma.customerOnboardingSession.findUnique({
    where: { id: onboardingId },
  });

  if (!onboarding) {
    return {
      ok: false,
      status: "NOT_FOUND",
    };
  }

  const events = await prisma.customerOnboardingEvent.findMany({
    where: { onboardingId },
    orderBy: { createdAt: "asc" },
  });

  return {
    ok: true,
    onboarding,
    events,
  };
}

export async function getCustomerCommercialDashboard(email: string) {
  const user = await prisma.customerUser.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: {
      memberships: true,
      onboardingRuns: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    return {
      ok: false,
      status: "NOT_FOUND",
    };
  }

  const organizationIds = user.memberships.map((membership) => membership.organizationId);

  const organizations = await prisma.customerOrganization.findMany({
    where: {
      id: { in: organizationIds },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    ok: true,
    user,
    organizations,
  };
}
