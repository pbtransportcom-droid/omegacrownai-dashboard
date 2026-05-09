import { NextResponse } from "next/server";
import { requireInternalKey } from "./apiGuard";
import { requireRateLimit } from "./rateLimit";

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

export function protectInternalRoute(
  req: Request,
  options?: {
    rateLimitPrefix?: string;
    limit?: number;
    windowMs?: number;
  }
): ProtectionResult {
  const rate = requireRateLimit(req, {
    prefix: options?.rateLimitPrefix || "internal",
    limit: options?.limit || 30,
    windowMs: options?.windowMs || 60_000,
  });

  if (!rate.ok) {
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
    return {
      ok: false,
      response:
        "response" in guard && guard.response
          ? guard.response
          : fallbackUnauthorized("UNAUTHORIZED_INTERNAL_API"),
    };
  }

  return {
    ok: true,
  };
}

export function protectPublicRoute(
  req: Request,
  options?: {
    rateLimitPrefix?: string;
    limit?: number;
    windowMs?: number;
  }
): ProtectionResult {
  const rate = requireRateLimit(req, {
    prefix: options?.rateLimitPrefix || "public",
    limit: options?.limit || 60,
    windowMs: options?.windowMs || 60_000,
  });

  if (!rate.ok) {
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
