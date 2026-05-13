import { NextResponse } from "next/server";
import { runPublishingExecutionAttempt } from "@/lib/sugent/publishing-execution/publishingExecutionEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const result = await runPublishingExecutionAttempt(attemptId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
