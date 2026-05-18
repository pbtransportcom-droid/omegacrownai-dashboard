import { NextRequest, NextResponse } from "next/server";
import {
  createAuditEventQueryPreview,
  getAuditEventQueryApiBlueprint,
} from "@/lib/sovereign/audit-event-query-api";

export async function GET(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const hasQuery = Object.keys(query).length > 0;

  if (hasQuery) {
    const preview = createAuditEventQueryPreview({
      ...query,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    });

    return NextResponse.json({
      ok: preview.ok,
      phase: "v18.6 Phase 206",
      service: "Audit Event Query Preview",
      preview,
    });
  }

  const auditQuery = getAuditEventQueryApiBlueprint();

  return NextResponse.json({
    ok: true,
    phase: "v18.6 Phase 206",
    service: "Audit Event Query API Blueprint",
    auditQuery,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const preview = createAuditEventQueryPreview(body || {});

  return NextResponse.json({
    ok: preview.ok,
    phase: "v18.6 Phase 206",
    service: "Audit Event Query Preview",
    preview,
  });
}
