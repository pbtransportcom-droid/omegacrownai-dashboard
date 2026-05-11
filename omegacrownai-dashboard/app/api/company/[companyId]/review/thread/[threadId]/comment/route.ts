import { NextResponse } from "next/server";
import { addReviewComment } from "@/lib/sugent/versioning/reviewEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string; threadId: string }> }
) {
  const { companyId, threadId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.body) {
    return NextResponse.json(
      { ok: false, error: "body is required" },
      { status: 400 }
    );
  }

  const comment = await addReviewComment({
    companyId,
    threadId,
    body: String(body.body),
    authorId: body.authorId ? String(body.authorId) : null,
  });

  return NextResponse.json({
    ok: true,
    comment,
  });
}
