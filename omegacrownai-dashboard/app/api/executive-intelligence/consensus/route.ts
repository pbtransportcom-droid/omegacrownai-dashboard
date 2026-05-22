import { NextResponse } from "next/server";
import { runExecutiveConsensus } from "@/lib/executive-intelligence/executiveDecisionCore";

export async function POST() {
  return NextResponse.json(runExecutiveConsensus());
}
