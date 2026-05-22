import { NextResponse } from "next/server";
import { resolveAgentNegotiation } from "@/lib/agent-negotiation/autonomousNegotiationEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(resolveAgentNegotiation(body));
}
