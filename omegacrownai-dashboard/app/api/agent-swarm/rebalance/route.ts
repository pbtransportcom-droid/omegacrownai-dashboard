import { NextResponse } from "next/server";
import { rebalanceAgentSwarm } from "@/lib/agent-swarm/autonomousAgentSwarm";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(rebalanceAgentSwarm(body));
}
