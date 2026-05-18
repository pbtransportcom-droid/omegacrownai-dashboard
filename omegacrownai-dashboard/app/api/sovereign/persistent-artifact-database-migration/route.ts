import { NextResponse } from "next/server";
import { getPersistentArtifactDatabaseMigration } from "@/lib/sovereign/persistent-artifact-database-migration";

export async function GET() {
  const migration = getPersistentArtifactDatabaseMigration();

  return NextResponse.json({
    ok: true,
    phase: "v25.3 Phase 273",
    service: "Persistent Artifact Database Migration",
    migration,
  });
}
