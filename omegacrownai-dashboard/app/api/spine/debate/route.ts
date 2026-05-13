import { NextResponse } from "next/server";
import { runDebate } from "@/lib/multi-agent-spine/multi-agent-spine";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.5 Phase 86",
      service: "OmegaCrownAI debate engine",
      messages: runDebate({
        prompt: "Debate the safest path for the next OmegaCrownAI subsystem."
      })
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
