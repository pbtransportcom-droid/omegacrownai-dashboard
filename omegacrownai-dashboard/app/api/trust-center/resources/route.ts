import { NextResponse } from "next/server";
import { trustCenterResources } from "@/lib/trust-center/final-production-trust-center";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.6 Phase 97",
      service: "Trust Center resources",
      resources: trustCenterResources
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
