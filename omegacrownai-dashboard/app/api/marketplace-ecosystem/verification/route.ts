import { NextResponse } from "next/server";
import { buildMarketplaceReport } from "@/lib/marketplace-ecosystem/marketplace-ecosystem";

export async function GET() {
  const report = buildMarketplaceReport();

  return NextResponse.json(
    {
      phase: "v7.0 Phase 91",
      service: "Provider verification engine",
      verifications: report.verifications,
      recommendations: report.recommendations
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
