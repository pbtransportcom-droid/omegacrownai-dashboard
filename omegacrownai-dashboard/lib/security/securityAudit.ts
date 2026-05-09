import { prisma } from "@/lib/db";
import { getClientIp } from "./apiGuard";

export async function logSecurityEvent({
  req,
  level = "info",
  action,
  allowed = false,
  reason,
  actorId,
  actorType,
  metadata = {},
}: {
  req?: Request;
  level?: "info" | "warn" | "error";
  action: string;
  allowed?: boolean;
  reason?: string | null;
  actorId?: string | null;
  actorType?: string | null;
  metadata?: any;
}) {
  try {
    const url = req ? new URL(req.url) : null;

    return await prisma.securityAuditEvent.create({
      data: {
        level,
        action,
        route: url?.pathname || null,
        method: req?.method || null,
        ip: req ? getClientIp(req) : null,
        actorId: actorId || null,
        actorType: actorType || null,
        userAgent: req?.headers.get("user-agent") || null,
        allowed,
        reason: reason || null,
        metadata,
      },
    });
  } catch {
    return null;
  }
}
