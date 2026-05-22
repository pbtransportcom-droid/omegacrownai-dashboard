import { NextResponse } from "next/server";
import { createAgentSwarm } from "@/lib/agent-swarm/autonomousAgentSwarm";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(createAgentSwarm(body));
}
