import { NextResponse } from "next/server";
import { generatePodcastVoiceJobs } from "@/lib/sugent/podcast/podcastEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string; podcastProjectId: string }> }
) {
  const { companyId, podcastProjectId } = await params;
  const contentType = req.headers.get("content-type") || "";

  const jobs = await generatePodcastVoiceJobs({
    companyId,
    podcastProjectId,
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/podcast`, req.url));
  }

  return NextResponse.json({
    ok: true,
    jobs,
  });
}
