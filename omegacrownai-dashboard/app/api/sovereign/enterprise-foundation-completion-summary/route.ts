import { NextResponse } from "next/server";
import { getEnterpriseFoundationCompletionSummary } from "@/lib/sovereign/enterprise-foundation-completion-summary";

export async function GET() {
  const summary = getEnterpriseFoundationCompletionSummary();

  return NextResponse.json({
    ok: true,
    phase: "v18.0 Phase 200",
    service: "Sovereign Enterprise Foundation Completion Summary",
    summary,
  });
}
