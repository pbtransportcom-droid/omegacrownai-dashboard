import { NextResponse } from "next/server";
import { generateForecasts } from "@/lib/executive-autopilot/executive-autopilot";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.9 Phase 90",
      service: "Executive KPI forecasts",
      forecasts: generateForecasts()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
