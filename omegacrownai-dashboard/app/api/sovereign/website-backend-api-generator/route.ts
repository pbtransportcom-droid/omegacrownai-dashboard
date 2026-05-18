import { NextResponse } from "next/server";
import { getWebsiteBackendApiGenerator } from "@/lib/sovereign/website-backend-api-generator";

export async function GET() {
  const backend = getWebsiteBackendApiGenerator();

  return NextResponse.json({
    ok: true,
    phase: "v23.1 Phase 251",
    service: "Website Backend/API Generator",
    backend,
  });
}
