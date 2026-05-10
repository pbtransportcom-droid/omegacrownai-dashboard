import { NextResponse } from "next/server";
import { ensureExecutiveSchedule, runScheduledExecutiveLoop } from "@/lib/sugent/executive/scheduler";
import { getExecutiveCommandCenter } from "@/lib/sugent/executive/commandCenter";
import { protectInternalRoute } from "@/lib/security/protectedRoute";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "executive-scheduled-run",
    limit: 20,
    action: "executive_scheduled_run",
  });
  if (!protection.ok) return protection.response;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const command = await getExecutiveCommandCenter(id);

  const schedule = await ensureExecutiveSchedule({
    projectId: id,
    companyId: command.ok && command.company ? command.company.id : null,
  });

  const result = await runScheduledExecutiveLoop({
    projectId: id,
    scheduleId: schedule.id,
    sessionId: body.sessionId || `executive-scheduled-${id}`,
    runtimeSessionId: body.runtimeSessionId || body.sessionId || `executive-scheduled-${id}`,
    limit: Number(body.limit || 10),
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
