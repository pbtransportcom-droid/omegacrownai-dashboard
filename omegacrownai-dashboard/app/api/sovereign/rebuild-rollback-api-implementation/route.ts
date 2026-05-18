import { NextResponse } from "next/server";
import { getRebuildRollbackApiImplementation } from "@/lib/sovereign/rebuild-rollback-api-implementation";

export async function GET() {
  const implementation = getRebuildRollbackApiImplementation();

  return NextResponse.json({
    ok: true,
    phase: "v25.4 Phase 274",
    service: "Rebuild/Rollback API Implementation",
    implementation,
  });
}
