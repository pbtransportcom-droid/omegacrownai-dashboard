import { NextResponse } from "next/server";
import { recoverIncompleteExecutions } from "@/lib/workflow-engine/state/distributedWorkflowState";

export async function POST() {
  return NextResponse.json(
    recoverIncompleteExecutions(),
  );
}
