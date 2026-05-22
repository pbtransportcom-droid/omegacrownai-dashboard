import { NextResponse } from "next/server";
import { getStrategicOpportunities } from "@/lib/strategy-engine/autonomousStrategyEngine";

export async function GET() {
  return NextResponse.json(getStrategicOpportunities());
}
