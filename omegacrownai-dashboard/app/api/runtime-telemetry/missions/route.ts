import { NextResponse } from "next/server";
import { getRuntimeMissions } from "@/lib/runtime-telemetry/sovereignRuntimeTelemetry";

export async function GET() {
  return NextResponse.json(getRuntimeMissions());
}
