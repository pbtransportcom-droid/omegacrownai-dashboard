import { NextResponse } from "next/server";
import {
  buildSmokeChecks,
  evaluateGoNoGo
} from "@/lib/launch-validation/production-launch-validation";

export async function GET() {
  const smokeChecks = buildSmokeChecks();

  return NextResponse.json(
    {
      phase: "v7.4 Phase 95",
      service: "Launch go/no-go validation",
      goNoGo: evaluateGoNoGo(smokeChecks)
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
