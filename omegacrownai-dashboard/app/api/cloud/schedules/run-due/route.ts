import { NextResponse } from "next/server";
import { runDueCloudSchedules } from "@/lib/sugent/cloud/scheduler";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const result = await runDueCloudSchedules({
    projectId: body.projectId || null,
    limit: Number(body.limit || 10),
  });

  return NextResponse.json(result);
}
