import { prisma } from "@/lib/db";
import { Permission, getRolePermissions, normalizeRole, roleHasPermission } from "@/lib/sugent/workspaces/permissions";

export async function ensureDefaultWorkspace(companyId: string) {
  const existing = await prisma.workspace.findFirst({
    where: {
      companyId,
      status: "active",
    },
    include: {
      members: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existing) return existing;

  return prisma.workspace.create({
    data: {
      companyId,
      name: "Default Workspace",
      status: "active",
      metadata: {
        source: "phase24_default_workspace",
      },
    },
    include: {
      members: true,
    },
  });
}

export async function addWorkspaceMember({
  companyId,
  workspaceId,
  userId,
  role = "viewer",
}: {
  companyId: string;
  workspaceId: string;
  userId: string;
  role?: string;
}) {
  const workspace = await prisma.workspace.findFirstOrThrow({
    where: {
      id: workspaceId,
      companyId,
    },
  });

  return prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId,
      },
    },
    update: {
      role: normalizeRole(role),
      status: "active",
    },
    create: {
      workspaceId: workspace.id,
      userId,
      role: normalizeRole(role),
      status: "active",
    },
  });
}

export async function listWorkspaces(companyId: string) {
  const workspaces = await prisma.workspace.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    ok: true,
    companyId,
    workspaces,
    summary: {
      workspaces: workspaces.length,
      members: workspaces.reduce((sum, workspace) => sum + workspace.members.length, 0),
      active: workspaces.filter((workspace) => workspace.status === "active").length,
    },
  };
}

export async function getWorkspaceDashboard(companyId: string) {
  const workspace = await ensureDefaultWorkspace(companyId);
  const data = await listWorkspaces(companyId);

  return {
    ...data,
    defaultWorkspaceId: workspace.id,
    permissions: {
      owner: getRolePermissions("owner"),
      admin: getRolePermissions("admin"),
      editor: getRolePermissions("editor"),
      reviewer: getRolePermissions("reviewer"),
      viewer: getRolePermissions("viewer"),
    },
  };
}

export async function assertWorkspacePermission({
  workspaceId,
  userId,
  permission,
}: {
  workspaceId: string;
  userId: string;
  permission: Permission;
}) {
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      status: "active",
    },
  });

  if (!member) {
    throw new Error("FORBIDDEN_NOT_WORKSPACE_MEMBER");
  }

  if (!roleHasPermission(member.role, permission)) {
    throw new Error("FORBIDDEN_INSUFFICIENT_WORKSPACE_PERMISSION");
  }

  return member;
}

export async function getWorkspaceForCompany(companyId: string) {
  return ensureDefaultWorkspace(companyId);
}
