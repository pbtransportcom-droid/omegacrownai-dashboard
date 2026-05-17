import { NextRequest, NextResponse } from "next/server";
import {
  createConnectorAuditRecord,
  getConnectorAuditTrailIntegration,
} from "@/lib/sovereign/connector-audit-trail";

export async function GET() {
  const audit = getConnectorAuditTrailIntegration();

  return NextResponse.json({
    ok: true,
    phase: "v17.8 Phase 198",
    service: "Connector Audit Trail Integration",
    audit,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const record = createConnectorAuditRecord(body || {});

  return NextResponse.json({
    ok: true,
    phase: "v17.8 Phase 198",
    service: "Connector Audit Record",
    record,
  });
}
