import { NextResponse } from "next/server";
import { createReviewThread } from "@/lib/sugent/versioning/reviewEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.projectId || !body.projectType || !body.body) {
    return NextResponse.json(
      { ok: false, error: "projectId, projectType, and body are required" },
      { status: 400 }
    );
  }

  const thread = await createReviewThread({
    companyId,
    projectId: String(body.projectId),
    projectType: String(body.projectType) as any,
    versionId: body.versionId ? String(body.versionId) : null,
    targetType: body.targetType ? String(body.targetType) as any : "project",
    targetId: body.targetId ? String(body.targetId) : null,
    body: String(body.body),
    authorId: body.authorId ? String(body.authorId) : null,
  });

  return NextResponse.json({
    ok: true,
    thread,
  });
}
