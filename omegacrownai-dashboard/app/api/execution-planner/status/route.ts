import { NextResponse } from "next/server";
import { getExecutionPlannerStatus } from "@/lib/execution-planner/autonomousExecutionPlanner";

export async function GET() {
  return NextResponse.json(getExecutionPlannerStatus());
}
