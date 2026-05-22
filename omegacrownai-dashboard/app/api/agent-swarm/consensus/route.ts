import { NextResponse } from "next/server";
import { runSwarmConsensus } from "@/lib/agent-swarm/autonomousAgentSwarm";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(runSwarmConsensus(body));
}
