import { NextResponse } from "next/server";
import { deploymentRunbook } from "@/lib/release-readiness/production-release-readiness";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.3 Phase 94",
      service: "Deployment runbook",
      deploymentRunbook
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
