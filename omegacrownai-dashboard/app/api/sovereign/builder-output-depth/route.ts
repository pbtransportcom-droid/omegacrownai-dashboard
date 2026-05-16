import { NextRequest, NextResponse } from "next/server";
import { getBuilderOutputDepth } from "@/lib/sovereign/builder-output-depth";

const departments = ["website", "app", "automation", "trading", "coding"];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const department = url.searchParams.get("department");

  if (department) {
    return NextResponse.json({
      ok: true,
      phase: "v13.8 Phase 158",
      service: "Sovereign Builder Output Depth Upgrade",
      outputDepth: getBuilderOutputDepth(department),
    });
  }

  const matrix = departments.map((item) => getBuilderOutputDepth(item));

  return NextResponse.json({
    ok: true,
    phase: "v13.8 Phase 158",
    service: "Sovereign Builder Output Depth Upgrade",
    totalDepartments: matrix.length,
    matrix,
  });
}
