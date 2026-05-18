import { NextResponse } from "next/server";
import { getWebsiteDatabaseSchemaGenerator } from "@/lib/sovereign/website-database-schema-generator";

export async function GET() {
  const database = getWebsiteDatabaseSchemaGenerator();

  return NextResponse.json({
    ok: true,
    phase: "v23.2 Phase 252",
    service: "Website Database Schema Generator",
    database,
  });
}
