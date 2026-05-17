import { NextRequest, NextResponse } from "next/server";
import {
  getConnectorManifestValidator,
  getSampleGitHubConnectorManifest,
  validateConnectorManifest,
} from "@/lib/sovereign/connector-manifest-validator";

export async function GET() {
  const validator = getConnectorManifestValidator();

  return NextResponse.json({
    ok: true,
    phase: "v17.5 Phase 195",
    service: "Sovereign Connector Manifest Validator",
    validator,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const manifest = body?.manifest || getSampleGitHubConnectorManifest();
  const validation = validateConnectorManifest(manifest);

  return NextResponse.json({
    ok: validation.ok,
    phase: "v17.5 Phase 195",
    service: "Sovereign Connector Manifest Validation Result",
    validation,
  });
}
