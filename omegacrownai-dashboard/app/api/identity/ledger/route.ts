import { NextResponse } from "next/server";
import {
  createLedgerEntry,
  sampleAgentProfile
} from "@/lib/identity-kernel/sovereign-identity-kernel";

export async function GET() {
  const entry = createLedgerEntry({
    profile: sampleAgentProfile,
    input: {
      prompt: "Create enterprise identity evidence."
    },
    output: {
      result: "Identity ledger event recorded."
    },
    metadata: {
      phase: "v6.3 Phase 84",
      mode: "sample_append_only_event"
    }
  });

  return NextResponse.json(
    {
      phase: "v6.3 Phase 84",
      service: "OmegaCrownAI identity ledger",
      mode: "foundation",
      appendOnlyPolicy:
        "Production ledger writes should be append-only and backed by persistent storage in a later hardening phase.",
      entries: [entry]
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
