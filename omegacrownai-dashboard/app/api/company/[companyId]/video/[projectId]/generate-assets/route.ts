import { NextResponse } from "next/server";
import { createAssetGenerationJobs } from "@/lib/sugent/video/assetEngine";

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

  const jobs = await createAssetGenerationJobs({
    companyId,
    projectId,
    includeVideo: body.includeVideo === true || body.includeVideo === "true",
    includeAvatar: body.includeAvatar === true || body.includeAvatar === "true",
    includeMusic: body.includeMusic !== false && body.includeMusic !== "false",
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/video`, req.url));
  }

  return NextResponse.json({
    ok: true,
    jobs,
  });
}
