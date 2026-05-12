import { NextResponse } from "next/server";
import { runProductionSmokeTest } from "@/lib/sugent/launch-readiness/launchReadinessEngine";

export async function GET() {
  const result = await runProductionSmokeTest();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
  });
}
