import { NextResponse } from "next/server";
import { updateLaunchChecklistItem } from "@/lib/sugent/launch-readiness/launchReadinessEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await updateLaunchChecklistItem({
    itemId,
    status: body.status ? String(body.status) : "passed",
    completedBy: body.completedBy ? String(body.completedBy) : "system-owner",
    evidenceJson: body.evidenceJson || {},
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
