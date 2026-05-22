import { NextResponse } from "next/server";
import { getAutonomousStrategyEngineStatus } from "@/lib/strategy-engine/autonomousStrategyEngine";

export async function GET() {
  return NextResponse.json(getAutonomousStrategyEngineStatus());
}
