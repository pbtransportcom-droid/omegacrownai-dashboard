import { NextResponse } from "next/server";
import { createPlatformWatermark } from "@/lib/sugent/identity/platformIdentityEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const watermark = await createPlatformWatermark({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    projectId: body.projectId ? String(body.projectId) : null,
    projectType: body.projectType ? String(body.projectType) : null,
    assetId: body.assetId ? String(body.assetId) : null,
    watermarkType: body.watermarkType ? String(body.watermarkType) : "metadata",
    source: body.source ? String(body.source) : "manual",
    prompt: body.prompt ? String(body.prompt) : null,
    metadata: body.metadata || {},
  });

  return NextResponse.json({
    ok: true,
    watermark,
  });
}
