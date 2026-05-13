import { NextResponse } from "next/server";
import {
  buildProductionReleasePackage,
  releaseReadinessControls
} from "@/lib/release-readiness/production-release-readiness";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.3 Phase 94",
      service: "Production release readiness",
      controls: releaseReadinessControls,
      release: buildProductionReleasePackage()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
