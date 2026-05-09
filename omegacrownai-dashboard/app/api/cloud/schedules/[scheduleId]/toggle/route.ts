import { NextResponse } from "next/server";
import { toggleCloudSchedule } from "@/lib/sugent/cloud/scheduler";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  const { scheduleId } = await params;
  const contentType = req.headers.get("content-type") || "";

  let enabled = true;

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    enabled = Boolean(body.enabled);
  } else {
    const form = await req.formData();
    enabled = String(form.get("enabled") || "false") === "true";
  }

  const schedule = await toggleCloudSchedule({
    scheduleId,
    enabled,
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${schedule.projectId}/cloud`, req.url));
  }

  return NextResponse.json({
    ok: true,
    schedule,
  });
}
