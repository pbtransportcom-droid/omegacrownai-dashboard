import { prisma } from "@/lib/db";
import { upsertCustomerSubscription } from "@/lib/sugent/customer-billing/customerPaymentProviderEngine";

export async function recordCustomerAdminAction({
  adminUserId,
  organizationId,
  userId,
  companyId,
  action,
  entityType,
  entityId,
  severity = "info",
  status = "recorded",
  reason,
  beforeJson,
  afterJson,
  metadata,
}: {
  adminUserId?: string | null;
  organizationId?: string | null;
  userId?: string | null;
  companyId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  severity?: string;
  status?: string;
  reason?: string | null;
  beforeJson?: any;
  afterJson?: any;
  metadata?: any;
}) {
  return prisma.customerAdminActionLog.create({
    data: {
      adminUserId: adminUserId || null,
      organizationId: organizationId || null,
      userId: userId || null,
      companyId: companyId || null,
      action,
      entityType: entityType || null,
      entityId: entityId || null,
      severity,
      status,
      reason: reason || null,
      beforeJson: beforeJson || undefined,
      afterJson: afterJson || undefined,
      metadata: metadata || {},
    },
  });
}

export async function getCustomerAdminDashboard({
  q,
}: {
  q?: string | null;
}) {
  const query = q?.trim();

  const [organizations, users, tickets, adminActions, abuseControls] = await Promise.all([
    prisma.customerOrganization.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
              { companyId: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        memberships: true,
      },
    }),
    prisma.customerUser.findMany({
      where: query
        ? {
            OR: [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.customerSupportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.customerAdminActionLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.customerAbuseControl.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    ok: true,
    organizations,
    users,
    tickets,
    adminActions,
    abuseControls,
    summary: {
      organizations: organizations.length,
      users: users.length,
      openTickets: tickets.filter((ticket) => ticket.status === "open").length,
      urgentTickets: tickets.filter((ticket) => ticket.priority === "urgent").length,
      activeAbuseControls: abuseControls.filter((control) => control.status === "active").length,
      adminActions: adminActions.length,
    },
  };
}

export async function getCustomerAdminOrganizationDetail(organizationId: string) {
  const organization = await prisma.customerOrganization.findUnique({
    where: { id: organizationId },
    include: {
      memberships: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
      // Subscription and provider records are fetched separately below to avoid stale Prisma relation typings.
      // v4 commercial related records are fetched separately below.
    },
  });

  if (!organization) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Customer organization not found.",
    };
  }

  const [subscriptions, paymentProviders, teamInvitations, externalAccounts, storageAssets] = await Promise.all([
    prisma.customerSubscription.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.paymentProvider.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.customerTeamInvitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.customerExternalAccount.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.customerStorageAsset.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const organizationWithDetails = {
    ...organization,
    subscriptions,
    paymentProviders,
    teamInvitations,
    externalAccounts,
    storageAssets,
  };

  const [tickets, adminActions, abuseControls] = await Promise.all([
    prisma.customerSupportTicket.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.customerAdminActionLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.customerAbuseControl.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    ok: true,
    organization: organizationWithDetails,
    tickets,
    adminActions,
    abuseControls,
    summary: {
      members: organization.memberships.length,
      subscriptions: subscriptions.length,
      providers: paymentProviders.length,
      storageAssets: storageAssets.length,
      tickets: tickets.length,
      activeAbuseControls: abuseControls.filter((control) => control.status === "active").length,
    },
  };
}

export async function createCustomerSupportTicket({
  organizationId,
  userId,
  companyId,
  subject,
  description,
  category = "technical",
  priority = "normal",
  metadata,
}: {
  organizationId?: string | null;
  userId?: string | null;
  companyId?: string | null;
  subject: string;
  description?: string | null;
  category?: string;
  priority?: string;
  metadata?: any;
}) {
  const ticket = await prisma.customerSupportTicket.create({
    data: {
      organizationId: organizationId || null,
      userId: userId || null,
      companyId: companyId || null,
      subject,
      description: description || null,
      category,
      priority,
      status: "open",
      metadata: metadata || {
        source: "v4_phase68_support_ticket",
      },
    },
  });

  await recordCustomerAdminAction({
    organizationId,
    userId,
    companyId,
    action: "SUPPORT_TICKET_CREATED",
    entityType: "CustomerSupportTicket",
    entityId: ticket.id,
    severity: priority === "urgent" ? "warning" : "info",
    afterJson: ticket,
  });

  return {
    ok: true,
    ticket,
  };
}

export async function updateCustomerSupportTicket({
  ticketId,
  status,
  priority,
  assignedToAdminId,
}: {
  ticketId: string;
  status?: string | null;
  priority?: string | null;
  assignedToAdminId?: string | null;
}) {
  const existing = await prisma.customerSupportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Support ticket not found.",
    };
  }

  const ticket = await prisma.customerSupportTicket.update({
    where: { id: ticketId },
    data: {
      status: status || existing.status,
      priority: priority || existing.priority,
      assignedToAdminId: assignedToAdminId ?? existing.assignedToAdminId,
      resolvedAt: status === "resolved" || status === "closed" ? new Date() : existing.resolvedAt,
    },
  });

  await recordCustomerAdminAction({
    organizationId: existing.organizationId,
    userId: existing.userId,
    companyId: existing.companyId,
    adminUserId: assignedToAdminId || null,
    action: "SUPPORT_TICKET_UPDATED",
    entityType: "CustomerSupportTicket",
    entityId: ticket.id,
    beforeJson: existing,
    afterJson: ticket,
  });

  return {
    ok: true,
    ticket,
  };
}

export async function adminOverrideCustomerSubscription({
  organizationId,
  companyId,
  planTier,
  provider = "manual",
  billingCycle = "manual",
  status = "manual",
  adminUserId = "system-admin",
  reason,
}: {
  organizationId: string;
  companyId?: string | null;
  planTier: string;
  provider?: string;
  billingCycle?: string;
  status?: string;
  adminUserId?: string | null;
  reason?: string | null;
}) {
  const before = await prisma.customerSubscription.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  const result = await upsertCustomerSubscription({
    organizationId,
    companyId: companyId || null,
    provider,
    planTier,
    billingCycle,
    status,
    actorId: adminUserId || "system-admin",
    actorType: "admin",
  });

  await recordCustomerAdminAction({
    adminUserId,
    organizationId,
    companyId,
    action: "SUBSCRIPTION_ADMIN_OVERRIDE",
    entityType: "CustomerSubscription",
    entityId: result.subscription.id,
    severity: "warning",
    reason: reason || "Admin subscription override.",
    beforeJson: before || {},
    afterJson: result.subscription,
    metadata: {
      source: "v4_phase68_subscription_override",
      planTier,
      provider,
      billingCycle,
      status,
    },
  });

  return {
    ok: true,
    subscription: result.subscription,
  };
}

export async function resetCustomerUsagePlaceholder({
  organizationId,
  companyId,
  usageType,
  adminUserId = "system-admin",
  reason,
}: {
  organizationId: string;
  companyId?: string | null;
  usageType?: string | null;
  adminUserId?: string | null;
  reason?: string | null;
}) {
  const action = await recordCustomerAdminAction({
    adminUserId,
    organizationId,
    companyId,
    action: "USAGE_RESET_PLACEHOLDER",
    entityType: "CustomerUsage",
    entityId: usageType || "all",
    severity: "warning",
    reason: reason || "Admin usage reset placeholder.",
    metadata: {
      source: "v4_phase68_usage_reset",
      usageType: usageType || "all",
      actualCounterMutation: false,
      note: "Phase 68 records the reset intent; direct counter reset can be wired to Phase 58/v4 usage meters later.",
    },
  });

  return {
    ok: true,
    action,
  };
}

export async function createCustomerAbuseControl({
  organizationId,
  userId,
  companyId,
  controlType,
  reason,
  severity = "warning",
  createdByAdminId = "system-admin",
}: {
  organizationId?: string | null;
  userId?: string | null;
  companyId?: string | null;
  controlType: string;
  reason?: string | null;
  severity?: string;
  createdByAdminId?: string | null;
}) {
  const control = await prisma.customerAbuseControl.create({
    data: {
      organizationId: organizationId || null,
      userId: userId || null,
      companyId: companyId || null,
      controlType,
      status: "active",
      reason: reason || null,
      severity,
      createdByAdminId: createdByAdminId || null,
      metadata: {
        source: "v4_phase68_abuse_control",
      },
    },
  });

  await recordCustomerAdminAction({
    adminUserId: createdByAdminId,
    organizationId,
    userId,
    companyId,
    action: "ABUSE_CONTROL_CREATED",
    entityType: "CustomerAbuseControl",
    entityId: control.id,
    severity,
    reason,
    afterJson: control,
  });

  return {
    ok: true,
    control,
  };
}

export async function liftCustomerAbuseControl({
  controlId,
  liftedByAdminId = "system-admin",
}: {
  controlId: string;
  liftedByAdminId?: string | null;
}) {
  const existing = await prisma.customerAbuseControl.findUnique({
    where: { id: controlId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Abuse control not found.",
    };
  }

  const control = await prisma.customerAbuseControl.update({
    where: { id: controlId },
    data: {
      status: "lifted",
      liftedAt: new Date(),
      liftedByAdminId: liftedByAdminId || null,
    },
  });

  await recordCustomerAdminAction({
    adminUserId: liftedByAdminId,
    organizationId: existing.organizationId,
    userId: existing.userId,
    companyId: existing.companyId,
    action: "ABUSE_CONTROL_LIFTED",
    entityType: "CustomerAbuseControl",
    entityId: control.id,
    severity: "info",
    beforeJson: existing,
    afterJson: control,
  });

  return {
    ok: true,
    control,
  };
}
