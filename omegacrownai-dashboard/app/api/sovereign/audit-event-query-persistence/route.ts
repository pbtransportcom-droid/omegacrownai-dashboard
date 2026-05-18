import { NextRequest, NextResponse } from "next/server";
import {
  createAuditEventQueryPersistencePreview,
  getAuditEventQueryPersistenceBlueprint,
} from "@/lib/sovereign/audit-event-query-persistence";

export async function GET(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());

  if (Object.keys(query).length > 0) {
    const preview = createAuditEventQueryPersistencePreview({
      ...query,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    });

    return NextResponse.json({
      ok: preview.ok,
      phase: "v19.3 Phase 213",
      service: "Audit Event Query Persistence Preview",
      preview,
    });
  }

  const persistence = getAuditEventQueryPersistenceBlueprint();

  return NextResponse.json({
    ok: true,
    phase: "v19.3 Phase 213",
    service: "Audit Event Query Persistence",
    persistence,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const preview = createAuditEventQueryPersistencePreview(body || {});

  return NextResponse.json({
    ok: preview.ok,
    phase: "v19.3 Phase 213",
    service: "Audit Event Query Persistence Preview",
    preview,
  });
}
