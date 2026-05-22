import { NextResponse } from "next/server";
import { generateExecutivePlan } from "@/lib/executive-intelligence/executiveDecisionCore";

export async function GET() {
  return NextResponse.json(generateExecutivePlan());
}
