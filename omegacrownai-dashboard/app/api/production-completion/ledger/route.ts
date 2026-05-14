import { NextResponse } from "next/server";
import {
  buildProductionCompletionLedger,
  productionCompletionControls
} from "@/lib/production-completion/production-completion-ledger";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v8.0 Phase 100",
      service: "Production completion ledger",
      controls: productionCompletionControls,
      ledger: buildProductionCompletionLedger()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
