import { NextResponse } from "next/server";
import { createProjectVersion } from "@/lib/sugent/versioning/versionEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string; projectType: string; projectId: string }> }
) {
  const { companyId, projectType, projectId } = await params;
  const contentType = req.headers.get("content-type") || "";

  let body: any = {};
  if (contentType.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData().catch(() => null);
    body = form ? Object.fromEntries(form.entries()) : {};
  }

  const version = await createProjectVersion({
    companyId,
    projectId,
    projectType: projectType as any,
    label: body.label ? String(body.label) : null,
    parentVersionId: body.parentVersionId ? String(body.parentVersionId) : null,
    createdById: body.createdById ? String(body.createdById) : null,
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(req.headers.get("referer") || new URL("/", req.url));
  }

  return NextResponse.json({
    ok: true,
    version,
  });
}
