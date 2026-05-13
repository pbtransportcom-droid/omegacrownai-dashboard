import { NextResponse } from "next/server";
import {
  calculateKPIs,
  createVariants,
  generateFeedback,
  sampleCampaign
} from "@/lib/distribution/distribution-super-pipeline";

export async function GET() {
  const variants = createVariants(sampleCampaign);
  const kpis = calculateKPIs({
    campaign: sampleCampaign,
    variants
  });

  return NextResponse.json(
    {
      phase: "v6.7 Phase 88",
      service: "Distribution KPI feedback",
      kpis,
      feedback: generateFeedback(kpis)
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
