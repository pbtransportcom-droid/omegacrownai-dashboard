import { NextResponse } from "next/server";
import { protectInternalRoute } from "@/lib/security/protectedRoute";
import { runDueExecutiveSchedules } from "@/lib/sugent/executive/cron";

export async function POST(req: Request) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "executive-cron",
    limit: 20,
    action: "executive_cron",
  });
  if (!protection.ok) return protection.response;

  const body = await req.json().catch(() => ({}));

  const result = await runDueExecutiveSchedules({
    force: body.force === true,
    runtimeSessionId: body.runtimeSessionId || "executive-cron",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}

export async function GET(req: Request) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "executive-cron-status",
    limit: 20,
    action: "executive_cron_status",
  });
  if (!protection.ok) return protection.response;

  return NextResponse.json({
    ok: true,
    endpoint: "executive_cron",
    enabled: process.env.OMEGA_EXECUTIVE_CRON_ENABLED === "true",
    production: process.env.NODE_ENV === "production",
    message: "POST this endpoint with the internal key to run due Executive schedules.",
  });
}
