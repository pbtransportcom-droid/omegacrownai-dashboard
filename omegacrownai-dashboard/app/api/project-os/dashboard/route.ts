import { NextResponse } from "next/server";
import {
  buildProjectOSDashboard,
  projectOSControls
} from "@/lib/project-os/unified-project-os";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.1 Phase 92",
      service: "Unified Project OS dashboard",
      controls: projectOSControls,
      dashboard: buildProjectOSDashboard()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
