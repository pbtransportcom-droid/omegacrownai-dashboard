import { NextResponse } from "next/server";
import { getRuntimeAgents } from "@/lib/runtime-telemetry/sovereignRuntimeTelemetry";

export async function GET() {
  return NextResponse.json(getRuntimeAgents());
}
