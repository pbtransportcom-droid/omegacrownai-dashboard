import { NextResponse } from "next/server";
import { getDeploymentSelfHostingReadinessLayer } from "@/lib/sovereign/deployment-self-hosting-readiness";

export async function GET() {
  const readiness = getDeploymentSelfHostingReadinessLayer();

  return NextResponse.json({
    ok: true,
    phase: "v17.2 Phase 192",
    service: "Deployment / Self-Hosting Readiness Layer",
    readiness,
  });
}
