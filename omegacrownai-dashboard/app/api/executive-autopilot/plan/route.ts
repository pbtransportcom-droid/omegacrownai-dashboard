import { NextResponse } from "next/server";
import { buildExecutivePlan } from "@/lib/executive-autopilot/executive-autopilot";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.9 Phase 90",
      service: "Executive Autopilot plan",
      plan: buildExecutivePlan()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
