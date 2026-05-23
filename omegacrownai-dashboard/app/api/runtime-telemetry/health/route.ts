import { NextResponse } from "next/server";
import { getRuntimeHealth } from "@/lib/runtime-telemetry/sovereignRuntimeTelemetry";

export async function GET() {
  return NextResponse.json(getRuntimeHealth());
}
