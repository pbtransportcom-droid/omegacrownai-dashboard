import { NextResponse } from "next/server";
import { releaseNotes } from "@/lib/release-readiness/production-release-readiness";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.3 Phase 94",
      service: "Release notes",
      releaseNotes
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
