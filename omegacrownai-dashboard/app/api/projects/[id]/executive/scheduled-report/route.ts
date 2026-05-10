import { NextResponse } from "next/server";
import { generateAndStoreDailyReport, ensureExecutiveSchedule } from "@/lib/sugent/executive/scheduler";
import { getExecutiveCommandCenter } from "@/lib/sugent/executive/commandCenter";
import { protectInternalRoute } from "@/lib/security/protectedRoute";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "executive-scheduled-report",
    limit: 20,
    action: "executive_scheduled_report",
  });
  if (!protection.ok) return protection.response;

  const { id } = await params;
  const command = await getExecutiveCommandCenter(id);

  const schedule = await ensureExecutiveSchedule({
    projectId: id,
    companyId: command.ok && command.company ? command.company.id : null,
  });

  const result = await generateAndStoreDailyReport({
    projectId: id,
    scheduleId: schedule.id,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
