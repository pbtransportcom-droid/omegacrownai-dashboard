import { NextResponse } from "next/server";
import { retryPublishingExecutionAttempt } from "@/lib/sugent/publishing-execution/publishingExecutionEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await retryPublishingExecutionAttempt({
    attemptId,
    retriedBy: body.retriedBy ? String(body.retriedBy) : "system-admin",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
