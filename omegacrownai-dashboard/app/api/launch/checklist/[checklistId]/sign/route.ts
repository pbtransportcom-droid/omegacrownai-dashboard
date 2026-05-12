import { NextResponse } from "next/server";
import { signLaunchChecklist } from "@/lib/sugent/launch-readiness/launchReadinessEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ checklistId: string }> }
) {
  const { checklistId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await signLaunchChecklist({
    checklistId,
    signedBy: body.signedBy ? String(body.signedBy) : "system-owner",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
