import { NextResponse } from "next/server";
import { getSelfLearningStatus } from "@/lib/sovereign/self-learning/selfImprovementKernel";

export async function GET() {
  return NextResponse.json(getSelfLearningStatus());
}
