import { NextResponse } from "next/server";
import { generateSelfImprovementReport } from "@/lib/sovereign/self-learning/selfImprovementKernel";

export async function GET() {
  return NextResponse.json(generateSelfImprovementReport());
}
