import { NextResponse } from "next/server";
import { getGovernancePermissionsAuditLayer } from "@/lib/sovereign/governance-permissions-audit";

export async function GET() {
  const governance = getGovernancePermissionsAuditLayer();

  return NextResponse.json({
    ok: true,
    phase: "v17.1 Phase 191",
    service: "Governance, Permissions & Audit Trail Layer",
    governance,
  });
}
