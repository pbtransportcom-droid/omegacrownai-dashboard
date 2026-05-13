import { NextResponse } from "next/server";
import {
  buildMarketplaceReport,
  marketplaceEcosystemControls
} from "@/lib/marketplace-ecosystem/marketplace-ecosystem";

export async function GET() {
  const report = buildMarketplaceReport();

  return NextResponse.json(
    {
      phase: "v7.0 Phase 91",
      service: "Marketplace provider registry",
      controls: marketplaceEcosystemControls,
      providers: report.providers,
      modules: report.modules,
      marketplaceReadiness: report.marketplaceReadiness
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
