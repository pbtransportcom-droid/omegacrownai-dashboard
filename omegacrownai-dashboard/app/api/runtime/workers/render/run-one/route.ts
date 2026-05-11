import { NextResponse } from "next/server";
import { runOneRenderWorker } from "@/lib/sugent/runtime/pipelineRuntime";

export async function POST() {
  const result = await runOneRenderWorker();
  return NextResponse.json(result);
}
