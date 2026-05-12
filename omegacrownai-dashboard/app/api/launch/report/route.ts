import { NextResponse } from "next/server";
import { generateV4CompletionReport } from "@/lib/sugent/launch-readiness/launchReadinessEngine";

export async function GET() {
  const result = await generateV4CompletionReport();
  return NextResponse.json(result);
}
