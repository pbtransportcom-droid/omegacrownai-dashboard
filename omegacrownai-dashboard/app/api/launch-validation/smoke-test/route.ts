import { NextResponse } from "next/server";
import { buildSmokeChecks } from "@/lib/launch-validation/production-launch-validation";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.4 Phase 95",
      service: "Production deployment smoke test",
      smokeChecks: buildSmokeChecks()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
