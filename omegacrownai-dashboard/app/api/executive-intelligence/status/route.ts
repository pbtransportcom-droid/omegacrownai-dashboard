import { NextResponse } from "next/server";
import { getExecutiveDecisionCoreStatus } from "@/lib/executive-intelligence/executiveDecisionCore";

export async function GET() {
  return NextResponse.json(getExecutiveDecisionCoreStatus());
}
