import { NextResponse } from "next/server";
import { requireInternalKey } from "./apiGuard";
import { requireRateLimit } from "./rateLimit";
import { getRequestActor, requireRole } from "./authGuard";
import { logSecurityEvent } from "./securityAudit";

export type ProtectionResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

function fallbackUnauthorized(error = "PROTECTION_FAILED") {
  return NextResponse.json(
    {
      ok: false,
      error,
    },
    { status: 401 }
  );
}

export async function protectInternalRoute(
  req: Request,
  options?: {
    rateLimitPrefix?: string;
    limit?: number;
    windowMs?: number;
    action?: string;
  }
): Promise<ProtectionResult> {
  const actor = getRequestActor(req);
  const action = options?.action || "internal_route_access";

  const rate = requireRateLimit(req, {
    prefix: options?.rateLimitPrefix || "internal",
    limit: options?.limit || 30,
    windowMs: options?.windowMs || 60_000,
  });

  if (!rate.ok) {
    await logSecurityEvent({
      req,
      level: "warn",
      action,
      allowed: false,
      reason: "RATE_LIMITED",
      actorId: actor.userId,
      actorType: actor.actorType,
      metadata: { rateLimitPrefix: options?.rateLimitPrefix },
    });

    return {
      ok: false,
      response:
        "response" in rate && rate.response
          ? rate.response
          : fallbackUnauthorized("RATE_LIMITED"),
    };
  }

  const guard = requireInternalKey(req);

  if (!guard.ok) {
    await logSecurityEvent({
      req,
      level: "warn",
      action,
      allowed: false,
      reason: "UNAUTHORIZED_INTERNAL_API",
      actorId: actor.userId,
      actorType: actor.actorType,
      metadata: { rateLimitPrefix: options?.rateLimitPrefix },
    });

    return {
      ok: false,
      response:
        "response" in guard && guard.response
          ? guard.response
          : fallbackUnauthorized("UNAUTHORIZED_INTERNAL_API"),
    };
  }

  await logSecurityEvent({
    req,
    level: "info",
    action,
    allowed: true,
    reason: guard.skipped ? "DEV_SKIPPED_INTERNAL_KEY" : "INTERNAL_KEY_VALID",
    actorId: actor.userId,
    actorType: actor.actorType,
    metadata: { rateLimitPrefix: options?.rateLimitPrefix },
  });

  return {
    ok: true,
  };
}

export async function protectAdminRoute(
  req: Request,
  options?: {
    rateLimitPrefix?: string;
    limit?: number;
    windowMs?: number;
    allowedRoles?: string[];
    action?: string;
  }
): Promise<ProtectionResult> {
  const actor = getRequestActor(req);
  const action = options?.action || "admin_route_access";

  const rate = requireRateLimit(req, {
    prefix: options?.rateLimitPrefix || "admin",
    limit: options?.limit || 20,
    windowMs: options?.windowMs || 60_000,
  });

  if (!rate.ok) {
    await logSecurityEvent({
      req,
      level: "warn",
      action,
      allowed: false,
      reason: "RATE_LIMITED",
      actorId: actor.userId,
      actorType: actor.actorType,
      metadata: { rateLimitPrefix: options?.rateLimitPrefix },
    });

    return {
      ok: false,
      response:
        "response" in rate && rate.response
          ? rate.response
          : fallbackUnauthorized("RATE_LIMITED"),
    };
  }

  const internal = requireInternalKey(req);
  if (internal.ok) {
    await logSecurityEvent({
      req,
      level: "info",
      action,
      allowed: true,
      reason: internal.skipped ? "DEV_SKIPPED_INTERNAL_KEY" : "INTERNAL_KEY_VALID",
      actorId: actor.userId,
      actorType: actor.actorType,
      metadata: { mode: "internal" },
    });

    return { ok: true };
  }

  const role = requireRole(req, options?.allowedRoles || ["admin", "owner"]);

  if (!role.ok) {
    await logSecurityEvent({
      req,
      level: "warn",
      action,
      allowed: false,
      reason: "FORBIDDEN_ROLE_REQUIRED",
      actorId: actor.userId,
      actorType: actor.actorType,
      metadata: {
        allowedRoles: options?.allowedRoles || ["admin", "owner"],
      },
    });

    return {
      ok: false,
      response:
        "response" in role && role.response
          ? role.response
          : fallbackUnauthorized("FORBIDDEN_ROLE_REQUIRED"),
    };
  }

  await logSecurityEvent({
    req,
    level: "info",
    action,
    allowed: true,
    reason: "ROLE_ALLOWED",
    actorId: actor.userId,
    actorType: actor.actorType,
    metadata: {
      role: role.actor.role,
    },
  });

  return {
    ok: true,
  };
}

export async function protectPublicRoute(
  req: Request,
  options?: {
    rateLimitPrefix?: string;
    limit?: number;
    windowMs?: number;
    action?: string;
  }
): Promise<ProtectionResult> {
  const actor = getRequestActor(req);
  const action = options?.action || "public_route_access";

  const rate = requireRateLimit(req, {
    prefix: options?.rateLimitPrefix || "public",
    limit: options?.limit || 60,
    windowMs: options?.windowMs || 60_000,
  });

  if (!rate.ok) {
    await logSecurityEvent({
      req,
      level: "warn",
      action,
      allowed: false,
      reason: "RATE_LIMITED",
      actorId: actor.userId,
      actorType: actor.actorType,
      metadata: { rateLimitPrefix: options?.rateLimitPrefix },
    });

    return {
      ok: false,
      response:
        "response" in rate && rate.response
          ? rate.response
          : fallbackUnauthorized("RATE_LIMITED"),
    };
  }

  return {
    ok: true,
  };
}
