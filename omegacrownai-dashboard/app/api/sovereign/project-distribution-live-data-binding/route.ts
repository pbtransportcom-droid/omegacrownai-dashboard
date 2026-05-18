import { NextRequest, NextResponse } from "next/server";
import { getProjectDistributionLiveDataBinding } from "@/lib/sovereign/project-distribution-live-data-binding";

export async function GET(request: NextRequest) {
  const projectId =
    request.nextUrl.searchParams.get("projectId") || "cmoyy1gl700004mkqn7or7hxr";

  const binding = getProjectDistributionLiveDataBinding(projectId);

  return NextResponse.json({
    ok: true,
    phase: "v25.1 Phase 271",
    service: "Project Distribution Live Data Binding",
    binding,
  });
}
