import { NextResponse } from "next/server";
import { getClientIp } from "./apiGuard";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit({
  key,
  limit = 60,
  windowMs = 60_000,
}: {
  key: string;
  limit?: number;
  windowMs?: number;
}) {
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  return {
    ok: bucket.count <= limit,
    count: bucket.count,
    limit,
    resetAt: bucket.resetAt,
  };
}

export function requireRateLimit(req: Request, options?: { prefix?: string; limit?: number; windowMs?: number }) {
  const ip = getClientIp(req);
  const key = `${options?.prefix || "api"}:${ip}`;

  const result = rateLimit({
    key,
    limit: options?.limit || 60,
    windowMs: options?.windowMs || 60_000,
  });

  if (!result.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: "RATE_LIMITED",
          limit: result.limit,
          resetAt: new Date(result.resetAt).toISOString(),
        },
        { status: 429 }
      ),
    };
  }

  return {
    ok: true,
    result,
  };
}
