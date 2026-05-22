import { NextResponse } from "next/server";
import { runStrategicScoringPreview } from "@/lib/strategy-engine/autonomousStrategyEngine";

export async function GET() {
  return NextResponse.json(runStrategicScoringPreview());
}
