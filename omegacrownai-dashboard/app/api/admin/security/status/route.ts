import { NextResponse } from "next/server";
import { protectAdminRoute } from "@/lib/security/protectedRoute";
import { isProduction } from "@/lib/security/apiGuard";

export async function GET(req: Request) {
  const protection = await protectAdminRoute(req, {
    rateLimitPrefix: "admin-security-status",
    limit: 20,
    action: "admin_security_status",
  });
  if (!protection.ok) return protection.response;

  return NextResponse.json({
    ok: true,
    security: {
      production: isProduction(),
      internalKeyConfigured: Boolean(process.env.OMEGA_INTERNAL_API_KEY),
      sourceMapsDisabled: true,
      internalApiGuard: true,
      authAwareGuard: true,
      rateLimit: true,
      auditLogging: true,
    },
    timestamp: new Date().toISOString(),
  });
}
