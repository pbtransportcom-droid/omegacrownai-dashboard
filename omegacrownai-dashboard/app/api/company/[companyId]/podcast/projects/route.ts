import { NextResponse } from "next/server";
import { createPodcastProject, getPodcastDashboard } from "@/lib/sugent/podcast/podcastEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const dashboard = await getPodcastDashboard(companyId);

  return NextResponse.json({
    ok: true,
    companyId,
    projects: dashboard.projects,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const contentType = req.headers.get("content-type") || "";

  let body: any = {};
  if (contentType.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData().catch(() => null);
    body = form ? Object.fromEntries(form.entries()) : {};
  }

  const project = await createPodcastProject({
    companyId,
    title: String(body.title || "OmegaCrown AI Podcast Episode"),
    description: body.description ? String(body.description) : String(body.topic || "A premium podcast episode."),
    tone: body.tone ? String(body.tone) : "premium, confident, educational",
    language: body.language ? String(body.language) : "en",
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/podcast`, req.url));
  }

  return NextResponse.json({
    ok: true,
    project,
  });
}
