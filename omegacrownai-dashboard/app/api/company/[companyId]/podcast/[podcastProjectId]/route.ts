import { NextResponse } from "next/server";
import { getPodcastProject } from "@/lib/sugent/podcast/podcastEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; podcastProjectId: string }> }
) {
  const { companyId, podcastProjectId } = await params;

  const project = await getPodcastProject(podcastProjectId, companyId);

  if (!project) {
    return NextResponse.json(
      { ok: false, error: "PODCAST_PROJECT_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    project,
  });
}
