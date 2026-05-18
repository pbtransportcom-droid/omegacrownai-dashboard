import { NextRequest, NextResponse } from "next/server";
import {
  createAuditExportPreview,
  getAuditExportApiBlueprint,
} from "@/lib/sovereign/audit-export-api";

export async function GET() {
  const auditExport = getAuditExportApiBlueprint();

  return NextResponse.json({
    ok: true,
    phase: "v18.9 Phase 209",
    service: "Audit Export API Blueprint",
    auditExport,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const preview = createAuditExportPreview(body || {});

  return NextResponse.json({
    ok: preview.ok,
    phase: "v18.9 Phase 209",
    service: "Audit Export Preview",
    preview,
  });
}
