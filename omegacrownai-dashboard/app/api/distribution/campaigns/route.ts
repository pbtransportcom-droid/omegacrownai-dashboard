import { NextResponse } from "next/server";
import { sampleCampaign } from "@/lib/distribution/distribution-super-pipeline";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.7 Phase 88",
      service: "Distribution campaigns",
      campaigns: [sampleCampaign]
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
