import { NextResponse } from "next/server";
import { getNegotiationEngineStatus } from "@/lib/agent-negotiation/autonomousNegotiationEngine";

export async function GET() {
  return NextResponse.json(getNegotiationEngineStatus());
}
