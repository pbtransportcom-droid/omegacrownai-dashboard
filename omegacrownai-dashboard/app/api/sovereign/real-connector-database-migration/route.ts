import { NextResponse } from "next/server";
import { getRealConnectorDatabaseMigration } from "@/lib/sovereign/real-connector-database-migration";

export async function GET() {
  const migration = getRealConnectorDatabaseMigration();

  return NextResponse.json({
    ok: true,
    phase: "v20.0 Phase 220",
    service: "Real Connector Database Migration",
    migration,
  });
}
