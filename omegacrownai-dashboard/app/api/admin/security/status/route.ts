import { NextResponse } from "next/server";
import { protectInternalRoute } from "@/lib/security/protectedRoute";
import { isProduction } from "@/lib/security/apiGuard";

export async function GET(req: Request) {
  const protection = protectInternalRoute(req, {
    rateLimitPrefix: "admin-security-status",
    limit: 20,
  });
  if (!protection.ok) return protection.response;

  return NextResponse.json({
    ok: true,
    security: {
      production: isProduction(),
      internalKeyConfigured: Boolean(process.env.OMEGA_INTERNAL_API_KEY),
      sourceMapsDisabled: true,
      internalApiGuard: true,
      rateLimit: true,
    },
    timestamp: new Date().toISOString(),
  });
}
