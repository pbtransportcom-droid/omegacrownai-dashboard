import { NextResponse } from "next/server";
import { getProjectDistributionPreviewCards } from "@/lib/sovereign/project-distribution-preview-cards";

export async function GET() {
  const cards = getProjectDistributionPreviewCards();

  return NextResponse.json({
    ok: true,
    phase: "v24.6 Phase 266",
    service: "Project Distribution Preview Cards",
    cards,
  });
}
