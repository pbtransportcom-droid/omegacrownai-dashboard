import { NextResponse } from "next/server";
import { rollbackChecklist } from "@/lib/release-readiness/production-release-readiness";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.3 Phase 94",
      service: "Rollback checklist",
      rollbackChecklist
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
