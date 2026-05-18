import { NextResponse } from "next/server";
import { getAuditEventReviewUiBlueprint } from "@/lib/sovereign/audit-event-review-ui";

export async function GET() {
  const reviewUi = getAuditEventReviewUiBlueprint();

  return NextResponse.json({
    ok: true,
    phase: "v18.7 Phase 207",
    service: "Audit Event Review UI Blueprint",
    reviewUi,
  });
}
