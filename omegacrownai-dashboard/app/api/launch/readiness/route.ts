import { NextResponse } from "next/server";
import { getLaunchReadinessDashboard, seedLaunchChecklist } from "@/lib/sugent/launch-readiness/launchReadinessEngine";

export async function GET() {
  const result = await getLaunchReadinessDashboard();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await seedLaunchChecklist({ version: "v4.0" });
  return NextResponse.json(result);
}
