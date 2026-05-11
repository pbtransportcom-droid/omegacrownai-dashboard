import { NextResponse } from "next/server";
import { createRenderJob } from "@/lib/sugent/video/render";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string }> }
) {
  const { companyId, projectId } = await params;
  const contentType = req.headers.get("content-type") || "";

  let body: any = {};
  if (contentType.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData().catch(() => null);
    body = form ? Object.fromEntries(form.entries()) : {};
  }

  const type = body.type === "audio_only" ? "audio_only" : "video";

  const job = await createRenderJob({
    companyId,
    projectId,
    type,
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/video`, req.url));
  }

  return NextResponse.json({
    ok: true,
    job,
  });
}
