import { NextResponse } from "next/server";
import { buildTrustCenterPackage } from "@/lib/trust-center/final-production-trust-center";

export async function GET() {
  const trustCenter = buildTrustCenterPackage();

  return NextResponse.json(
    {
      phase: "v7.6 Phase 97",
      service: "Trust Center status",
      status: trustCenter.publicStatus,
      signals: trustCenter.signals,
      trustHash: trustCenter.trustHash
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
