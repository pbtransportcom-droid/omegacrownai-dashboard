import { prisma } from "@/lib/db";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";

const DEFAULT_POLICIES = [
  {
    name: "Allow runtime viewing",
    resource: "runtime",
    action: "read",
    effect: "allow",
    priority: 10,
  },
  {
    name: "Require approval authority for render",
    resource: "render",
    action: "execute",
    effect: "allow",
    priority: 20,
    conditions: { minAuthorityLevel: 5 },
  },
  {
    name: "Require sovereign authority for publish",
    resource: "publish",
    action: "execute",
    effect: "allow",
    priority: 20,
    conditions: { minAuthorityLevel: 7 },
  },
  {
    name: "Require sovereign authority for passport issue",
    resource: "passport",
    action: "issue",
    effect: "allow",
    priority: 20,
    conditions: { minAuthorityLevel: 7 },
  },
  {
    name: "Block governance mutation without owner",
    resource: "governance",
    action: "write",
    effect: "allow",
    priority: 20,
    conditions: { minAuthorityLevel: 9 },
  },
];

const DEFAULT_ROLES = [
  {
    name: "Sovereign Owner",
    slug: "sovereign_owner",
    authorityLevel: 10,
    permissions: {
      resources: ["*"],
      actions: ["*"],
      approvalAuthority: true,
      sovereignAuthority: true,
    },
  },
  {
    name: "Executive Operator",
    slug: "executive_operator",
    authorityLevel: 7,
    permissions: {
      resources: ["runtime", "render", "publish", "passport", "audit", "identity"],
      actions: ["read", "execute", "issue"],
      approvalAuthority: true,
      sovereignAuthority: false,
    },
  },
  {
    name: "Creative Lead",
    slug: "creative_lead",
    authorityLevel: 5,
    permissions: {
      resources: ["creative", "asset-room", "sound-room", "editors-room", "directors-room", "render"],
      actions: ["read", "write", "execute"],
      approvalAuthority: true,
      sovereignAuthority: false,
    },
  },
  {
    name: "Viewer",
    slug: "viewer",
    authorityLevel: 1,
    permissions: {
      resources: ["runtime", "observability"],
      actions: ["read"],
      approvalAuthority: false,
      sovereignAuthority: false,
    },
  },
];

function normalize(value: string) {
  return String(value || "").toLowerCase().trim();
}

function permissionMatches(value: string, list: any[]) {
  return list.includes("*") || list.map(String).map(normalize).includes(normalize(value));
}

function policyConditionPasses(policy: any, authorityLevel: number) {
  const conditions = policy.conditions || {};
  const minAuthorityLevel = Number(conditions.minAuthorityLevel || 0);

  if (authorityLevel < minAuthorityLevel) return false;

  return true;
}

export async function ensureGovernanceTenant({
  companyId,
  workspaceId,
  name,
}: {
  companyId: string;
  workspaceId?: string | null;
  name?: string | null;
}) {
  const existing = await prisma.governanceTenant.findFirst({
    where: {
      companyId,
      workspaceId: workspaceId || null,
    },
    include: {
      policies: true,
      roles: {
        include: {
          assignments: true,
        },
      },
    },
  });

  if (existing) {
    return existing;
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  const tenant = await prisma.governanceTenant.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      name: name || `${company?.name || "OmegaCrownAI"} Governance Tenant`,
      status: "active",
      sovereigntyLevel: "sovereign",
      metadata: {
        source: "phase37_governance",
      },
    },
  });

  await prisma.governancePolicy.createMany({
    data: DEFAULT_POLICIES.map((policy) => ({
      tenantId: tenant.id,
      companyId,
      workspaceId: workspaceId || null,
      name: policy.name,
      scope: "company",
      resource: policy.resource,
      action: policy.action,
      effect: policy.effect,
      priority: policy.priority,
      conditions: policy.conditions || {},
      status: "active",
    })),
  });

  const roles = [];
  for (const role of DEFAULT_ROLES) {
    const created = await prisma.governanceRole.create({
      data: {
        tenantId: tenant.id,
        companyId,
        workspaceId: workspaceId || null,
        name: role.name,
        slug: role.slug,
        authorityLevel: role.authorityLevel,
        permissions: role.permissions,
        status: "active",
      },
    });
    roles.push(created);
  }

  const ownerRole = roles.find((role) => role.slug === "sovereign_owner");

  if (ownerRole) {
    await prisma.governanceRoleAssignment.create({
      data: {
        roleId: ownerRole.id,
        companyId,
        workspaceId: workspaceId || null,
        actorId: "system-owner",
        actorType: "system",
        status: "active",
      },
    });
  }

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    actorId: "governance-engine",
    actorType: "system",
    action: "GOVERNANCE_TENANT_CREATED",
    entityType: "GovernanceTenant",
    entityId: tenant.id,
    severity: "info",
    metadata: {
      tenantId: tenant.id,
      policies: DEFAULT_POLICIES.length,
      roles: DEFAULT_ROLES.length,
    },
  });

  return prisma.governanceTenant.findUniqueOrThrow({
    where: { id: tenant.id },
    include: {
      policies: true,
      roles: {
        include: {
          assignments: true,
        },
      },
    },
  });
}

export async function createGovernanceRoleAssignment({
  companyId,
  workspaceId,
  roleSlug,
  actorId,
  actorType = "system",
}: {
  companyId: string;
  workspaceId?: string | null;
  roleSlug: string;
  actorId: string;
  actorType?: string;
}) {
  const tenant = await ensureGovernanceTenant({
    companyId,
    workspaceId: workspaceId || null,
  });

  const role = await prisma.governanceRole.findFirst({
    where: {
      tenantId: tenant.id,
      slug: roleSlug,
      status: "active",
    },
  });

  if (!role) {
    return {
      ok: false,
      status: "ROLE_NOT_FOUND",
      reason: `Role not found: ${roleSlug}`,
    };
  }

  const assignment = await prisma.governanceRoleAssignment.create({
    data: {
      roleId: role.id,
      companyId,
      workspaceId: workspaceId || null,
      actorId,
      actorType,
      status: "active",
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    actorId: "governance-engine",
    actorType: "system",
    action: "GOVERNANCE_ROLE_ASSIGNED",
    entityType: "GovernanceRoleAssignment",
    entityId: assignment.id,
    severity: "info",
    metadata: {
      roleSlug,
      actorId,
      actorType,
    },
  });

  return {
    ok: true,
    status: "ASSIGNED",
    assignment,
    role,
  };
}

export async function authorizeGovernanceAction({
  companyId,
  workspaceId,
  actorId = "system-owner",
  actorType = "system",
  resource,
  action,
  metadata,
}: {
  companyId: string;
  workspaceId?: string | null;
  actorId?: string | null;
  actorType?: string;
  resource: string;
  action: string;
  metadata?: any;
}) {
  const tenant = await ensureGovernanceTenant({
    companyId,
    workspaceId: workspaceId || null,
  });

  const assignments = await prisma.governanceRoleAssignment.findMany({
    where: {
      companyId,
      workspaceId: workspaceId || null,
      actorId: actorId || "system-owner",
      actorType,
      status: "active",
    },
    include: {
      role: true,
    },
  });

  const roles = assignments.map((assignment) => assignment.role).filter(Boolean);
  const highestAuthority = roles.reduce((max, role) => Math.max(max, role.authorityLevel), 0);

  const roleAllowed = roles.some((role: any) => {
    const permissions = role.permissions || {};
    return (
      permissionMatches(resource, permissions.resources || []) &&
      permissionMatches(action, permissions.actions || [])
    );
  });

  const policies = await prisma.governancePolicy.findMany({
    where: {
      tenantId: tenant.id,
      status: "active",
      resource,
      action,
    },
    orderBy: {
      priority: "asc",
    },
  });

  let decision = "deny";
  let reason = "No matching role permission or policy authority.";
  let matchedPolicy: any = null;
  let matchedRole: any = roles[0] || null;

  for (const policy of policies) {
    const conditionPass = policyConditionPasses(policy, highestAuthority);

    if (policy.effect === "deny" && conditionPass) {
      decision = "deny";
      reason = `Denied by policy: ${policy.name}`;
      matchedPolicy = policy;
      break;
    }

    if (policy.effect === "allow" && roleAllowed && conditionPass) {
      decision = "allow";
      reason = `Allowed by policy: ${policy.name}`;
      matchedPolicy = policy;
      matchedRole = roles.find((role: any) => role.authorityLevel === highestAuthority) || matchedRole;
      break;
    }
  }

  if (!policies.length && roleAllowed) {
    decision = "allow";
    reason = "Allowed by role permission.";
  }

  const record = await prisma.governanceDecision.create({
    data: {
      tenantId: tenant.id,
      companyId,
      workspaceId: workspaceId || null,
      actorId: actorId || null,
      actorType,
      resource,
      action,
      decision,
      reason,
      matchedPolicyId: matchedPolicy?.id || null,
      matchedRoleId: matchedRole?.id || null,
      metadata: {
        ...(metadata || {}),
        highestAuthority,
        roles: roles.map((role: any) => ({
          id: role.id,
          slug: role.slug,
          authorityLevel: role.authorityLevel,
        })),
      },
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    actorId: actorId || "system-owner",
    actorType,
    action: decision === "allow" ? "GOVERNANCE_AUTHORIZED" : "GOVERNANCE_DENIED",
    entityType: "GovernanceDecision",
    entityId: record.id,
    severity: decision === "allow" ? "info" : "warning",
    metadata: {
      resource,
      action,
      decision,
      reason,
      highestAuthority,
    },
  });

  return {
    ok: decision === "allow",
    status: decision === "allow" ? "AUTHORIZED" : "DENIED",
    decision: record,
    reason,
    tenant,
    roles,
    matchedPolicy,
  };
}

export async function listGovernanceDashboard(companyId: string) {
  const tenant = await ensureGovernanceTenant({ companyId });

  const [policies, roles, assignments, decisions] = await Promise.all([
    prisma.governancePolicy.findMany({
      where: { companyId },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.governanceRole.findMany({
      where: { companyId },
      orderBy: [{ authorityLevel: "desc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        assignments: true,
      },
    }),
    prisma.governanceRoleAssignment.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        role: true,
      },
    }),
    prisma.governanceDecision.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    ok: true,
    companyId,
    tenant,
    policies,
    roles,
    assignments,
    decisions,
    summary: {
      policies: policies.length,
      roles: roles.length,
      assignments: assignments.length,
      decisions: decisions.length,
      allowed: decisions.filter((item) => item.decision === "allow").length,
      denied: decisions.filter((item) => item.decision === "deny").length,
      sovereigntyLevel: tenant.sovereigntyLevel,
    },
  };
}
