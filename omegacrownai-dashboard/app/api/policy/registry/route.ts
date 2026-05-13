import { NextResponse } from "next/server";
import {
  policyEngineControls,
  samplePolicies
} from "@/lib/global-policy-engine/global-policy-engine";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.4 Phase 85",
      service: "OmegaCrownAI policy registry",
      status: "foundation",
      policyCount: samplePolicies.length,
      controls: policyEngineControls,
      policies: samplePolicies
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
