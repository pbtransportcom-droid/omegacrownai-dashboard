import { NextResponse } from "next/server";
import { getAgentSwarmStatus } from "@/lib/agent-swarm/autonomousAgentSwarm";

export async function GET() {
  return NextResponse.json(getAgentSwarmStatus());
}
