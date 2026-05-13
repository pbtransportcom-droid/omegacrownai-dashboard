import { NextResponse } from "next/server";
import {
  detectPolicyConflicts,
  samplePolicies
} from "@/lib/global-policy-engine/global-policy-engine";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.4 Phase 85",
      service: "OmegaCrownAI policy conflict resolver",
      status: "ready",
      conflictPolicy:
        "Higher priority wins; if priority is equal, more specific scope wins; if still tied, deny wins fail-safe.",
      conflicts: detectPolicyConflicts(samplePolicies)
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
