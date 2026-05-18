import { NextResponse } from "next/server";
import { getExecutionRunnerPersistentActionLog } from "@/lib/sovereign/execution-runner-persistent-action-log";

export async function GET() {
  const actionLog = getExecutionRunnerPersistentActionLog();

  return NextResponse.json({
    ok: true,
    phase: "v18.4 Phase 204",
    service: "Execution Runner Persistent Action Log",
    actionLog,
  });
}
