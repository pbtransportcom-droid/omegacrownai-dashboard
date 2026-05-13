import { NextResponse } from "next/server";
import {
  buildCreativeProductionPackage,
  creativeSuperDepartmentControls
} from "@/lib/creative-super-department/creative-super-department";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.8 Phase 89",
      service: "Creative directors room",
      controls: creativeSuperDepartmentControls,
      package: buildCreativeProductionPackage()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
