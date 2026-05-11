import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createVideoProject } from "@/lib/sugent/video/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const projects = await prisma.videoProject.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      script: true,
      timeline: true,
      scenes: { orderBy: { index: "asc" } },
      assets: true,
    },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    projects,
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
    body = await req.json();
  } else {
    const form = await req.formData();
    body = Object.fromEntries(form.entries());
  }

  const project = await createVideoProject({
    companyId,
    title: String(body.title || "OmegaCrown AI Video Project"),
    description: body.description ? String(body.description) : null,
    objective: body.objective ? String(body.objective) : String(body.description || "Create a premium video."),
    offer: body.offer ? String(body.offer) : "OmegaCrown AI Company OS",
    audience: {
      segment: String(body.audience || body.segment || "founders and operators"),
    },
    channels: ["website", "email", "social"],
    aspectRatio: String(body.aspectRatio || "16:9"),
    tone: String(body.tone || "premium"),
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/video`, req.url));
  }

  return NextResponse.json({
    ok: true,
    project,
  });
}
