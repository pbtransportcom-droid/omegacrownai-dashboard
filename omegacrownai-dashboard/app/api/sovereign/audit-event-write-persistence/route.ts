import { NextRequest, NextResponse } from "next/server";
import {
  createAuditEventPersistencePreview,
  getAuditEventWritePersistenceBlueprint,
} from "@/lib/sovereign/audit-event-write-persistence";

export async function GET() {
  const persistence = getAuditEventWritePersistenceBlueprint();

  return NextResponse.json({
    ok: true,
    phase: "v19.2 Phase 212",
    service: "Audit Event Write Persistence",
    persistence,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const preview = createAuditEventPersistencePreview(body || {});

  return NextResponse.json({
    ok: preview.ok,
    phase: "v19.2 Phase 212",
    service: "Audit Event Persistence Preview",
    preview,
  });
}
