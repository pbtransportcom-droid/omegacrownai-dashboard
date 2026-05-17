import { NextRequest, NextResponse } from "next/server";
import { getBuilderOutputDepthScore } from "@/lib/sovereign/builder-output-depth-score";

export async function GET(request: NextRequest) {
  const department =
    request.nextUrl.searchParams.get("department") ||
    request.nextUrl.searchParams.get("builder") ||
    "general";

  const depth = getBuilderOutputDepthScore(department);

  return NextResponse.json({
    ok: true,
    phase: "v16.8 Phase 188",
    service: "Builder Output Depth + Full-Function Standard",
    department,
    depth,
  });
}
