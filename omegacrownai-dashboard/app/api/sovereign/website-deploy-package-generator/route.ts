import { NextResponse } from "next/server";
import { getWebsiteDeployPackageGenerator } from "@/lib/sovereign/website-deploy-package-generator";

export async function GET() {
  const deploy = getWebsiteDeployPackageGenerator();

  return NextResponse.json({
    ok: true,
    phase: "v23.5 Phase 255",
    service: "Website Deploy Package Generator",
    deploy,
  });
}
