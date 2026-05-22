import { NextResponse } from "next/server";
import { openAgentNegotiation } from "@/lib/agent-negotiation/autonomousNegotiationEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(openAgentNegotiation(body));
}
