import { NextResponse } from "next/server";
import { getPersistentAuditDatabaseSchema } from "@/lib/sovereign/persistent-audit-database-schema";

export async function GET() {
  const schema = getPersistentAuditDatabaseSchema();

  return NextResponse.json({
    ok: true,
    phase: "v18.1 Phase 201",
    service: "Persistent Audit Database Schema",
    schema,
  });
}
