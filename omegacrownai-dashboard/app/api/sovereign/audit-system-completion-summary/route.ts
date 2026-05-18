import { NextResponse } from "next/server";
import { getSovereignAuditSystemCompletionSummary } from "@/lib/sovereign/audit-system-completion-summary";

export async function GET() {
  const summary = getSovereignAuditSystemCompletionSummary();

  return NextResponse.json({
    ok: true,
    phase: "v19.0 Phase 210",
    service: "Sovereign Audit System Completion Summary",
    summary,
  });
}
