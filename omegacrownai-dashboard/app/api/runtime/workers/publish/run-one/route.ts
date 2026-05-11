import { NextResponse } from "next/server";
import { runOnePublishWorker } from "@/lib/sugent/runtime/pipelineRuntime";

export async function POST() {
  const result = await runOnePublishWorker();
  return NextResponse.json(result);
}
