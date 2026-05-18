import { NextResponse } from "next/server";
import { getAuditReviewUiPage } from "@/lib/sovereign/audit-review-ui-page";

export async function GET() {
  const page = getAuditReviewUiPage();

  return NextResponse.json({
    ok: true,
    phase: "v19.4 Phase 214",
    service: "Audit Review UI Page",
    page,
  });
}
