import { NextResponse } from "next/server";
import { reviewExecutionProgress } from "@/lib/execution-planner/autonomousExecutionPlanner";

export async function GET() {
  return NextResponse.json(reviewExecutionProgress());
}
