import { NextResponse } from "next/server";
import {
  complianceEvidence,
  complianceControlSummary,
  evaluateComplianceReadiness
} from "@/lib/compliance/enterprise-compliance-evidence";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.2 Phase 83",
      service: "OmegaCrownAI compliance evidence",
      evaluatedAt: new Date().toISOString(),
      readiness: evaluateComplianceReadiness(),
      evidence: complianceEvidence,
      controls: complianceControlSummary
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
