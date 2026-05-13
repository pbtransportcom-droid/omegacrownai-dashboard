import { NextResponse } from "next/server";
import { createProject } from "@/lib/project-os/unified-project-os";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.1 Phase 92",
      service: "Project OS projects",
      projects: [createProject()]
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
