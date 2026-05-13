import { NextResponse } from "next/server";
import {
  createBuildHistory,
  createProject
} from "@/lib/project-os/unified-project-os";

export async function GET() {
  const project = createProject();

  return NextResponse.json(
    {
      phase: "v7.1 Phase 92",
      service: "Project OS build history",
      builds: createBuildHistory(project)
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
