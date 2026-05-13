import { NextResponse } from "next/server";
import { providerDependencies } from "@/lib/platform-limitations/platform-limitation-controls";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.5 Phase 96",
      service: "Provider dependency notice",
      providerDependencies
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
