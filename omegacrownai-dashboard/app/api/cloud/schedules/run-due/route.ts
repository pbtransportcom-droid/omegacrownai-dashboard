import { NextResponse } from "next/server";
import { protectInternalRoute } from "@/lib/security/protectedRoute";
import { runDueCloudSchedules } from "@/lib/sugent/cloud/scheduler";

export async function POST(req: Request) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "cloud-schedules-run-due",
    limit: 20,
  });
  if (!protection.ok) return protection.response;


  const body = await req.json().catch(() => ({}));

  const result = await runDueCloudSchedules({
    projectId: body.projectId || null,
    limit: Number(body.limit || 10),
  });

  return NextResponse.json(result);
}
