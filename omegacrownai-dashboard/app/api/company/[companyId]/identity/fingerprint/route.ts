import { NextResponse } from "next/server";
import { createAssetFingerprint } from "@/lib/sugent/identity/platformIdentityEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.sourceType) {
    return NextResponse.json(
      { ok: false, error: "sourceType is required" },
      { status: 400 }
    );
  }

  const fingerprint = await createAssetFingerprint({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    projectId: body.projectId ? String(body.projectId) : null,
    projectType: body.projectType ? String(body.projectType) : null,
    assetId: body.assetId ? String(body.assetId) : null,
    sourceType: String(body.sourceType),
    prompt: body.prompt ? String(body.prompt) : null,
    content: body.content ? String(body.content) : null,
    metadata: body.metadata || {},
  });

  return NextResponse.json({
    ok: true,
    fingerprint,
  });
}
