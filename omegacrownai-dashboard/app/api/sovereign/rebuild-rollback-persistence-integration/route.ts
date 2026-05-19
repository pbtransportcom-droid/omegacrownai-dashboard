import { NextResponse } from "next/server";
import { getRebuildRollbackPersistenceIntegration } from "@/lib/sovereign/rebuild-rollback-persistence-integration";

export async function GET() {
  const integration = getRebuildRollbackPersistenceIntegration();

  return NextResponse.json({
    ok: true,
    phase: "v25.9 Phase 279",
    service: "Rebuild/Rollback Persistence Integration",
    integration,
  });
}
