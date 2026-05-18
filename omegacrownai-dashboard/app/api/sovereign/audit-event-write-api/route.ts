import { NextRequest, NextResponse } from "next/server";
import {
  createAuditEventWritePreview,
  getAuditEventWriteApiBlueprint,
} from "@/lib/sovereign/audit-event-write-api";

export async function GET() {
  const auditWrite = getAuditEventWriteApiBlueprint();

  return NextResponse.json({
    ok: true,
    phase: "v18.5 Phase 205",
    service: "Audit Event Write API Blueprint",
    auditWrite,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const preview = createAuditEventWritePreview(body || {});

  return NextResponse.json({
    ok: preview.ok,
    phase: "v18.5 Phase 205",
    service: "Audit Event Write Preview",
    preview,
  });
}
