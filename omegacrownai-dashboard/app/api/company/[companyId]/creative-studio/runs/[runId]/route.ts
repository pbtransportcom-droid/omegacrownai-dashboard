import { NextResponse } from "next/server";
import { getCreativeAgentRun } from "@/lib/sugent/creative-agents/coordinator";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; runId: string }> }
) {
  const { runId } = await params;

  const run = await getCreativeAgentRun(runId);

  if (!run) {
    return NextResponse.json(
      { ok: false, error: "CREATIVE_AGENT_RUN_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    run,
  });
}
