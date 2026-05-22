import { NextResponse } from "next/server";
import { generateExecutionPlan } from "@/lib/execution-planner/autonomousExecutionPlanner";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(generateExecutionPlan(body.objectiveId));
}
