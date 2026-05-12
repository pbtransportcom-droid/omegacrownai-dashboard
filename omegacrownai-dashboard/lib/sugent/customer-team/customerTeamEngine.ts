import crypto from "crypto";
import { prisma } from "@/lib/db";

const VALID_ROLES = ["owner", "admin", "editor", "viewer", "billing"];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ["org:read", "org:update", "team:manage", "billing:manage", "project:create", "project:edit", "project:view", "api_keys:manage"],
  admin: ["org:read", "org:update", "team:manage", "billing:manage", "project:create", "project:edit", "project:view", "api_keys:manage"],
  editor: ["org:read", "project:create", "project:edit", "project:view"],
  viewer: ["org:read", "project:view"],
  billing: ["org:read", "billing:manage"],
};

function normalizeRole(role?: string | null) {
  const value = String(role || "viewer").toLowerCase();
  return VALID_ROLES.includes(value) ? value : "viewer";
}

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function makeInviteToken() {
  const raw = `invite_${crypto.randomBytes(24).toString("hex")}`;
  return {
    raw,
    hash: hashValue(raw),
  };
}

export function permissionsForRole(role: string) {
  return ROLE_PERMISSIONS[normalizeRole(role)] || ROLE_PERMISSIONS.viewer;
}

export async function getCustomerTeamDashboard(organizationId: string) {
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

  const [memberships, invitations, overrides] = await Promise.all([
    prisma.customerMembership.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.customerTeamInvitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.customerPermissionOverride.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    ok: true,
    organization,
    memberships,
    invitations,
    overrides,
    rolePermissions: ROLE_PERMISSIONS,
    summary: {
      members: memberships.length,
      activeMembers: memberships.filter((item) => item.status === "active").length,
      pendingInvitations: invitations.filter((item) => item.status === "pending").length,
      overrides: overrides.length,
      owners: memberships.filter((item) => item.role === "owner").length,
      admins: memberships.filter((item) => item.role === "admin").length,
    },
  };
}

export async function inviteCustomerTeamMember({
  organizationId,
  email,
  role = "viewer",
  invitedByUserId,
}: {
  organizationId: string;
  email: string;
  role?: string;
  invitedByUserId?: string | null;
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

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = normalizeRole(role);
  const token = makeInviteToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await prisma.customerTeamInvitation.create({
    data: {
      organizationId,
      email: normalizedEmail,
      role: normalizedRole,
      status: "pending",
      invitedByUserId: invitedByUserId || null,
      tokenHash: token.hash,
      expiresAt,
      metadata: {
        source: "v4_phase64_team_invite",
        inviteUrl: `/api/customer-org/${organizationId}/team/invitations/accept?token=${token.raw}`,
      },
    },
  });

  await prisma.customerOnboardingEvent.create({
    data: {
      onboardingId: `team-${organizationId}`,
      organizationId,
      userId: invitedByUserId || null,
      type: "TEAM_INVITATION_CREATED",
      status: "recorded",
      message: `Team invitation created for ${normalizedEmail}.`,
      metadata: {
        invitationId: invitation.id,
        email: normalizedEmail,
        role: normalizedRole,
      },
    },
  });

  return {
    ok: true,
    invitation,
    inviteToken: token.raw,
    inviteUrl: `/api/customer-org/${organizationId}/team/invitations/accept?token=${token.raw}`,
    warning: "Copy this invite token now. It will not be shown again.",
  };
}

export async function acceptCustomerTeamInvitation({
  token,
  name,
}: {
  token: string;
  name?: string | null;
}) {
  const tokenHash = hashValue(token);

  const invitation = await prisma.customerTeamInvitation.findUnique({
    where: { tokenHash },
  });

  if (!invitation) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Invitation not found.",
    };
  }

  if (invitation.status !== "pending" || invitation.expiresAt < new Date()) {
    return {
      ok: false,
      status: "INVALID",
      reason: "Invitation is not pending or has expired.",
    };
  }

  const user = await prisma.customerUser.upsert({
    where: { email: invitation.email },
    create: {
      email: invitation.email,
      name: name || invitation.email.split("@")[0],
      status: "active",
      emailVerified: false,
      metadata: {
        source: "v4_phase64_invitation_accept",
      },
    },
    update: {
      name: name || undefined,
    },
  });

  const membership = await prisma.customerMembership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: invitation.organizationId,
      },
    },
    create: {
      userId: user.id,
      organizationId: invitation.organizationId,
      role: invitation.role,
      status: "active",
      invitedByUserId: invitation.invitedByUserId || null,
      acceptedAt: new Date(),
      metadata: {
        source: "v4_phase64_invitation_accept",
        invitationId: invitation.id,
      },
    },
    update: {
      role: invitation.role,
      status: "active",
      acceptedAt: new Date(),
    },
  });

  const accepted = await prisma.customerTeamInvitation.update({
    where: { id: invitation.id },
    data: {
      status: "accepted",
      acceptedByUserId: user.id,
      acceptedAt: new Date(),
    },
  });

  await prisma.customerOnboardingEvent.create({
    data: {
      onboardingId: `team-${invitation.organizationId}`,
      organizationId: invitation.organizationId,
      userId: user.id,
      type: "TEAM_INVITATION_ACCEPTED",
      status: "recorded",
      message: `Team invitation accepted by ${invitation.email}.`,
      metadata: {
        invitationId: invitation.id,
        membershipId: membership.id,
        role: invitation.role,
      },
    },
  });

  return {
    ok: true,
    user,
    membership,
    invitation: accepted,
  };
}

export async function updateCustomerMembershipRole({
  membershipId,
  role,
  status,
  actorUserId,
}: {
  membershipId: string;
  role?: string | null;
  status?: string | null;
  actorUserId?: string | null;
}) {
  const existing = await prisma.customerMembership.findUnique({
    where: { id: membershipId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Membership not found.",
    };
  }

  const updated = await prisma.customerMembership.update({
    where: { id: membershipId },
    data: {
      role: role ? normalizeRole(role) : existing.role,
      status: status || existing.status,
      metadata: {
        ...(existing.metadata as any || {}),
        roleUpdatedAt: new Date().toISOString(),
        roleUpdatedBy: actorUserId || "system-owner",
        previousRole: existing.role,
        previousStatus: existing.status,
      },
    },
  });

  await prisma.customerOnboardingEvent.create({
    data: {
      onboardingId: `team-${existing.organizationId}`,
      organizationId: existing.organizationId,
      userId: actorUserId || existing.userId,
      type: "TEAM_MEMBERSHIP_UPDATED",
      status: "recorded",
      message: "Team membership updated.",
      metadata: {
        membershipId,
        previousRole: existing.role,
        nextRole: updated.role,
        previousStatus: existing.status,
        nextStatus: updated.status,
      },
    },
  });

  return {
    ok: true,
    membership: updated,
  };
}

export async function revokeCustomerTeamInvitation(invitationId: string) {
  const existing = await prisma.customerTeamInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Invitation not found.",
    };
  }

  const invitation = await prisma.customerTeamInvitation.update({
    where: { id: invitationId },
    data: {
      status: "revoked",
      metadata: {
        ...(existing.metadata as any || {}),
        revokedAt: new Date().toISOString(),
      },
    },
  });

  await prisma.customerOnboardingEvent.create({
    data: {
      onboardingId: `team-${existing.organizationId}`,
      organizationId: existing.organizationId,
      userId: existing.invitedByUserId || null,
      type: "TEAM_INVITATION_REVOKED",
      status: "recorded",
      message: "Team invitation revoked.",
      metadata: {
        invitationId,
        email: existing.email,
      },
    },
  });

  return {
    ok: true,
    invitation,
  };
}

export async function upsertCustomerPermissionOverride({
  organizationId,
  userId,
  resourceType,
  resourceId,
  action,
  effect = "allow",
  reason,
  createdByUserId,
}: {
  organizationId: string;
  userId?: string | null;
  resourceType: string;
  resourceId?: string | null;
  action: string;
  effect?: string;
  reason?: string | null;
  createdByUserId?: string | null;
}) {
  const override = await prisma.customerPermissionOverride.create({
    data: {
      organizationId,
      userId: userId || null,
      resourceType,
      resourceId: resourceId || null,
      action,
      effect: effect === "deny" ? "deny" : "allow",
      reason: reason || null,
      createdByUserId: createdByUserId || null,
      metadata: {
        source: "v4_phase64_permission_override",
      },
    },
  });

  await prisma.customerOnboardingEvent.create({
    data: {
      onboardingId: `team-${organizationId}`,
      organizationId,
      userId: createdByUserId || userId || null,
      type: "PERMISSION_OVERRIDE_CREATED",
      status: "recorded",
      message: "Permission override created.",
      metadata: {
        overrideId: override.id,
        resourceType,
        resourceId,
        action,
        effect: override.effect,
      },
    },
  });

  return {
    ok: true,
    override,
  };
}

export async function checkCustomerPermission({
  organizationId,
  userId,
  permission,
  resourceType = "organization",
  resourceId,
}: {
  organizationId: string;
  userId: string;
  permission: string;
  resourceType?: string;
  resourceId?: string | null;
}) {
  const membership = await prisma.customerMembership.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });

  if (!membership || membership.status !== "active") {
    return {
      ok: false,
      status: "DENIED",
      reason: "No active membership.",
    };
  }

  const overrides = await prisma.customerPermissionOverride.findMany({
    where: {
      organizationId,
      userId,
      resourceType,
      OR: [
        { resourceId: resourceId || null },
        { resourceId: null },
      ],
      action: permission,
    },
    orderBy: { createdAt: "desc" },
  });

  const explicitDeny = overrides.find((item) => item.effect === "deny");
  if (explicitDeny) {
    return {
      ok: false,
      status: "DENIED",
      reason: "Denied by permission override.",
      membership,
      override: explicitDeny,
    };
  }

  const explicitAllow = overrides.find((item) => item.effect === "allow");
  if (explicitAllow) {
    return {
      ok: true,
      status: "ALLOWED",
      reason: "Allowed by permission override.",
      membership,
      override: explicitAllow,
    };
  }

  const allowed = permissionsForRole(membership.role).includes(permission);

  return {
    ok: allowed,
    status: allowed ? "ALLOWED" : "DENIED",
    reason: allowed ? "Allowed by role." : "Role does not include permission.",
    membership,
    rolePermissions: permissionsForRole(membership.role),
  };
}
