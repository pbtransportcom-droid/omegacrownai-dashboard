import { NextResponse } from "next/server";
import { buildProductionCompletionLedger } from "@/lib/production-completion/production-completion-ledger";

export async function GET() {
  const ledger = buildProductionCompletionLedger();

  return NextResponse.json(
    {
      phase: "v8.0 Phase 100",
      service: "Final production activation record",
      productionStatus: ledger.productionStatus,
      finalActivation: ledger.finalActivation,
      latestKnownCommit: ledger.latestKnownCommit,
      completionHash: ledger.completionHash
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
