import { NextResponse } from "next/server";
import {
  buildTrustCenterPackage,
  trustCenterControls
} from "@/lib/trust-center/final-production-trust-center";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.6 Phase 97",
      service: "OmegaCrownAI Trust Center",
      controls: trustCenterControls,
      trustCenter: buildTrustCenterPackage()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
