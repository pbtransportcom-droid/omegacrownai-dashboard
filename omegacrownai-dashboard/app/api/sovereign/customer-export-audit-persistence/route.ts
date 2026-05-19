import { NextResponse } from "next/server";
import { getCustomerExportAuditPersistence } from "@/lib/sovereign/customer-export-audit-persistence";

export async function GET() {
  const persistence = getCustomerExportAuditPersistence();

  return NextResponse.json({
    ok: true,
    phase: "v25.7 Phase 277",
    service: "Customer Export Audit Persistence",
    persistence,
  });
}
