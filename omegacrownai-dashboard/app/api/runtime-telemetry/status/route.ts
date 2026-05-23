import { NextResponse } from "next/server";
import { getRuntimeTelemetryStatus } from "@/lib/runtime-telemetry/sovereignRuntimeTelemetry";

export async function GET() {
  return NextResponse.json(getRuntimeTelemetryStatus());
}
