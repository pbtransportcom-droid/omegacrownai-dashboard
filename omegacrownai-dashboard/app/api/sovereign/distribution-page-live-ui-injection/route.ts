import { NextRequest, NextResponse } from "next/server";
import { getDistributionPageLiveUiInjection } from "@/lib/sovereign/distribution-page-live-ui-injection";

export async function GET(request: NextRequest) {
  const projectId =
    request.nextUrl.searchParams.get("projectId") || "cmoyy1gl700004mkqn7or7hxr";

  const injection = getDistributionPageLiveUiInjection(projectId);

  return NextResponse.json({
    ok: true,
    phase: "v25.6 Phase 276",
    service: "Distribution Page Live UI Injection",
    injection,
  });
}
