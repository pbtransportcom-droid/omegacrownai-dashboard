import { NextResponse } from "next/server";
import { sourceReliabilityTiers } from "@/lib/platform-limitations/platform-limitation-controls";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.5 Phase 96",
      service: "Source reliability controls",
      sourceReliabilityTiers
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
