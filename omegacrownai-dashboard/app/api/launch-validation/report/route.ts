import { NextResponse } from "next/server";
import { buildLaunchValidationReport } from "@/lib/launch-validation/production-launch-validation";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.4 Phase 95",
      service: "Launch validation report",
      report: buildLaunchValidationReport()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
