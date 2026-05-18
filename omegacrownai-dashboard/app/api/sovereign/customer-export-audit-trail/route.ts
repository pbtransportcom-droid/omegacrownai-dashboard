import { NextResponse } from "next/server";
import { getCustomerExportAuditTrail } from "@/lib/sovereign/customer-export-audit-trail";

export async function GET() {
  const auditTrail = getCustomerExportAuditTrail();

  return NextResponse.json({
    ok: true,
    phase: "v25.2 Phase 272",
    service: "Customer Export Audit Trail",
    auditTrail,
  });
}
