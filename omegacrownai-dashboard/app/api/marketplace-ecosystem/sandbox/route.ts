import { NextResponse } from "next/server";
import { buildMarketplaceReport } from "@/lib/marketplace-ecosystem/marketplace-ecosystem";

export async function GET() {
  const report = buildMarketplaceReport();

  return NextResponse.json(
    {
      phase: "v7.0 Phase 91",
      service: "Provider sandbox runtime",
      sandboxRuns: report.sandboxRuns
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
