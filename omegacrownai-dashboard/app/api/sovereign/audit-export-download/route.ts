import { NextRequest, NextResponse } from "next/server";
import {
  createAuditExportDownloadPackage,
  getAuditExportDownloadRouteBlueprint,
} from "@/lib/sovereign/audit-export-download";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const download = params.get("download") === "1";

  if (!download) {
    const blueprint = getAuditExportDownloadRouteBlueprint();

    return NextResponse.json({
      ok: true,
      phase: "v19.6 Phase 216",
      service: "Audit Export Download Route",
      blueprint,
    });
  }

  const pkg = createAuditExportDownloadPackage({
    exportType: params.get("exportType") || "correlation_replay_export",
    correlationId: params.get("correlationId") || "corr_phase_208_sample",
    requestedBy: params.get("requestedBy") || "admin",
    reason: params.get("reason") || "internal_review",
    format: "json",
  });

  return new NextResponse(JSON.stringify(pkg, null, 2), {
    status: pkg.ok ? 200 : 400,
    headers: pkg.downloadHeaders,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const pkg = createAuditExportDownloadPackage(body || {});

  return NextResponse.json({
    ok: pkg.ok,
    phase: "v19.6 Phase 216",
    service: "Audit Export Download Preview",
    package: pkg,
  });
}
