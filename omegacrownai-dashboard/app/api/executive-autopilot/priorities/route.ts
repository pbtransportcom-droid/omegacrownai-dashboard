import { NextResponse } from "next/server";
import {
  allocateBudget,
  prioritizeInitiatives
} from "@/lib/executive-autopilot/executive-autopilot";

export async function GET() {
  const initiatives = prioritizeInitiatives();

  return NextResponse.json(
    {
      phase: "v6.9 Phase 90",
      service: "Executive priorities",
      initiatives,
      budget: allocateBudget(initiatives)
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
