import { NextResponse } from "next/server";
import {
  buildPlatformLimitationPackage,
  platformLimitationControls
} from "@/lib/platform-limitations/platform-limitation-controls";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.5 Phase 96",
      service: "Platform limitation disclosure",
      controls: platformLimitationControls,
      package: buildPlatformLimitationPackage()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
