import { NextResponse } from "next/server";
import { getPersistentMultiAgentMemoryRegistry } from "@/lib/sovereign/multi-agent-memory-registry";

export async function GET() {
  const registry = getPersistentMultiAgentMemoryRegistry();

  return NextResponse.json({
    ok: true,
    phase: "v17.0 Phase 190",
    service: "Persistent Multi-Agent Memory Registry",
    registry,
  });
}
