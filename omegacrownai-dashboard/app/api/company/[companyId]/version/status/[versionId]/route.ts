import { NextResponse } from "next/server";
import { updateProjectVersionStatus } from "@/lib/sugent/versioning/versionEngine";

async function handle(
  req: Request,
  { params }: { params: Promise<{ companyId: string; versionId: string }> }
) {
  const { companyId, versionId } = await params;
  const contentType = req.headers.get("content-type") || "";

  let body: any = {};
  if (contentType.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData().catch(() => null);
    body = form ? Object.fromEntries(form.entries()) : {};
  }

  const version = await updateProjectVersionStatus({
    companyId,
    versionId,
    status: String(body.status || "in_review") as any,
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(req.headers.get("referer") || new URL("/", req.url));
  }

  return NextResponse.json({
    ok: true,
    version,
  });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ companyId: string; versionId: string }> }
) {
  return handle(req, ctx);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ companyId: string; versionId: string }> }
) {
  return handle(req, ctx);
}
