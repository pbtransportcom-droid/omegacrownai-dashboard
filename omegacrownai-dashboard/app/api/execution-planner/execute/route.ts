import { NextResponse } from "next/server";
import { executeStrategicPlan } from "@/lib/execution-planner/autonomousExecutionPlanner";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(executeStrategicPlan(body.planId));
}
