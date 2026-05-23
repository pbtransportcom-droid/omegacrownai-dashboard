import { NextResponse } from "next/server";
import { getRuntimeEvents } from "@/lib/runtime-telemetry/sovereignRuntimeTelemetry";

export async function GET() {
  return NextResponse.json(getRuntimeEvents());
}
