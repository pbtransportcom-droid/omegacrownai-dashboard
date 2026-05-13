import { NextResponse } from "next/server";
import {
  computeConsensus,
  runCritique,
  runDebate
} from "@/lib/multi-agent-spine/multi-agent-spine";

export async function GET() {
  const messages = runDebate({
    prompt: "Select the best governed execution path."
  });
  const critiques = runCritique(messages);
  const consensus = computeConsensus({
    messages,
    critiques
  });

  return NextResponse.json(
    {
      phase: "v6.5 Phase 86",
      service: "OmegaCrownAI consensus engine",
      messages,
      critiques,
      consensus
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
