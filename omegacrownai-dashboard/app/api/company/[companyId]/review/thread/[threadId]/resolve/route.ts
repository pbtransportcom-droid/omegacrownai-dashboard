import { NextResponse } from "next/server";
import { resolveReviewThread } from "@/lib/sugent/versioning/reviewEngine";

async function handle(
  req: Request,
  { params }: { params: Promise<{ companyId: string; threadId: string }> }
) {
  const { companyId, threadId } = await params;
  const contentType = req.headers.get("content-type") || "";

  const result = await resolveReviewThread({
    companyId,
    threadId,
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(req.headers.get("referer") || new URL("/", req.url));
  }

  return NextResponse.json({
    ok: true,
    result,
  });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ companyId: string; threadId: string }> }
) {
  return handle(req, ctx);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ companyId: string; threadId: string }> }
) {
  return handle(req, ctx);
}
