import { NextResponse } from "next/server";
import { runDistributionPipeline } from "@/lib/distribution/distribution-super-pipeline";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.7 Phase 88",
      service: "OmegaCrownAI Distribution Super-Pipeline",
      result: runDistributionPipeline()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
