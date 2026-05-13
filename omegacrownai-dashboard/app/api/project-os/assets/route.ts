import { NextResponse } from "next/server";
import {
  createAssetLibrary,
  createProject
} from "@/lib/project-os/unified-project-os";

export async function GET() {
  const project = createProject();

  return NextResponse.json(
    {
      phase: "v7.1 Phase 92",
      service: "Project OS asset library",
      assets: createAssetLibrary(project)
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
