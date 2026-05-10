import { NextResponse } from "next/server";
import { ensureExecutiveSchedule } from "@/lib/sugent/executive/scheduler";
import { getExecutiveCommandCenter } from "@/lib/sugent/executive/commandCenter";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const command = await getExecutiveCommandCenter(id);

  const schedule = await ensureExecutiveSchedule({
    projectId: id,
    companyId: command.ok && command.company ? command.company.id : null,
  });

  return NextResponse.json({
    ok: true,
    schedule,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const command = await getExecutiveCommandCenter(id);

  const schedule = await ensureExecutiveSchedule({
    projectId: id,
    companyId: command.ok && command.company ? command.company.id : null,
    name: String(body.name || "Daily Executive Health Report"),
    hour: Number(body.hour || 9),
    timezone: String(body.timezone || "America/Chicago"),
  });

  return NextResponse.json({
    ok: true,
    schedule,
  });
}
