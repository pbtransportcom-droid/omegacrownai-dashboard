import { NextResponse } from "next/server";
import { getPersistentArtifactStorage } from "@/lib/sovereign/persistent-artifact-storage";

export async function GET() {
  const storage = getPersistentArtifactStorage();

  return NextResponse.json({
    ok: true,
    phase: "v24.8 Phase 268",
    service: "Persistent Artifact Storage",
    storage,
  });
}
