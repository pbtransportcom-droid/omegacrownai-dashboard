import { NextResponse } from "next/server";
import { getStrategicObjectives } from "@/lib/strategy-engine/autonomousStrategyEngine";

export async function GET() {
  return NextResponse.json(getStrategicObjectives());
}
