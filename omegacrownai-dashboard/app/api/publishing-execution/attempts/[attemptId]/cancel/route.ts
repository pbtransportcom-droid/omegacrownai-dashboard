import { NextResponse } from "next/server";
import { cancelPublishingExecutionAttempt } from "@/lib/sugent/publishing-execution/publishingExecutionEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await cancelPublishingExecutionAttempt({
    attemptId,
    cancelledBy: body.cancelledBy ? String(body.cancelledBy) : "system-admin",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
