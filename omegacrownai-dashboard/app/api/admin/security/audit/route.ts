import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { protectAdminRoute } from "@/lib/security/protectedRoute";

export async function GET(req: Request) {
  const protection = await protectAdminRoute(req, {
    rateLimitPrefix: "admin-security-audit",
    limit: 30,
    action: "admin_security_audit_list",
  });
  if (!protection.ok) return protection.response;

  const { searchParams } = new URL(req.url);

  const allowed = searchParams.get("allowed");
  const level = searchParams.get("level");
  const action = searchParams.get("action");

  const events = await prisma.securityAuditEvent.findMany({
    where: {
      ...(allowed === "true" ? { allowed: true } : {}),
      ...(allowed === "false" ? { allowed: false } : {}),
      ...(level ? { level } : {}),
      ...(action ? { action } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    ok: true,
    events,
  });
}
