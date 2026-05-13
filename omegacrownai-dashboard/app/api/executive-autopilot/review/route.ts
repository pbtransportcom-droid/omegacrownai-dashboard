import { NextResponse } from "next/server";
import {
  buildExecutivePlan,
  reviewExecutivePlan
} from "@/lib/executive-autopilot/executive-autopilot";

export async function GET() {
  const plan = buildExecutivePlan();

  return NextResponse.json(
    {
      phase: "v6.9 Phase 90",
      service: "Executive review loop",
      review: reviewExecutivePlan(plan)
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
