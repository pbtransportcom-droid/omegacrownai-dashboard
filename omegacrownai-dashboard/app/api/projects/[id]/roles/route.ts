import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureProjectOwnerRole, requirePermission } from "@/lib/sugent/permissions/check";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";

const allowedRoles = new Set(["owner", "admin", "editor", "viewer"]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const roles = await prisma.userRole.findMany({
    where: {
      projectId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    ok: true,
    roles,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authConfig);

  const actor = session?.user?.email || "system";

  await ensureProjectOwnerRole({
    userId: actor,
    projectId: id,
  });

  await requirePermission({
    userId: actor,
    projectId: id,
    domain: "project",
    action: "manage_roles",
  });

  const form = await req.formData();

  const userId = String(form.get("userId") || "").trim();
  const role = String(form.get("role") || "viewer").trim();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "userId is required." },
      { status: 400 }
    );
  }

  if (!allowedRoles.has(role)) {
    return NextResponse.json(
      { ok: false, error: "Invalid role." },
      { status: 400 }
    );
  }

  const saved = await prisma.userRole.upsert({
    where: {
      userId_projectId: {
        userId,
        projectId: id,
      },
    },
    update: {
      role,
    },
    create: {
      userId,
      projectId: id,
      role,
    },
  });

  await AuditLogger.log({
    projectId: id,
    actorType: "user",
    actorId: actor,
    action: "SAFETY_CHECKED",
    metadata: {
      action: "role_updated",
      targetUserId: userId,
      role,
    },
  });

  return NextResponse.redirect(new URL(`/projects/${id}/settings/roles`, req.url));
}
