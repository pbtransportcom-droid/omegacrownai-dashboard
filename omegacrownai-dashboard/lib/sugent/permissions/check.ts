import { prisma } from "@/lib/db";
import { roleAllows, type PermissionDomain } from "./matrix";

export async function ensureProjectOwnerRole({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  const existing = await prisma.userRole.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (existing) return existing;

  return prisma.userRole.create({
    data: {
      userId,
      projectId,
      role: "owner",
    },
  });
}

export async function getProjectRole({
  userId,
  projectId,
}: {
  userId: string;
  projectId?: string | null;
}) {
  if (!userId) return null;

  if (projectId) {
    const projectRole = await prisma.userRole.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (projectRole) return projectRole;
  }

  return prisma.userRole.findFirst({
    where: {
      userId,
      projectId: null,
    },
  });
}

export async function hasPermission({
  userId,
  projectId,
  domain,
  action,
}: {
  userId: string;
  projectId?: string | null;
  domain: PermissionDomain;
  action: string;
}) {
  const role = await getProjectRole({ userId, projectId });

  if (!role) return false;

  return roleAllows(role.role, domain, action);
}

export async function requirePermission(args: {
  userId: string;
  projectId?: string | null;
  domain: PermissionDomain;
  action: string;
}) {
  const ok = await hasPermission(args);

  if (!ok) {
    throw new Error(`Permission denied: ${args.domain}.${args.action}`);
  }

  return true;
}
