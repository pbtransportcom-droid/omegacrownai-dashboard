import { NextResponse } from "next/server";
import { executeCreatorExport } from "@/lib/sugent/creator-export/creatorExportEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.projectId) {
    return NextResponse.json(
      { ok: false, error: "projectId is required" },
      { status: 400 }
    );
  }

  const result = await executeCreatorExport({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    projectId: String(body.projectId),
    projectType: body.projectType ? String(body.projectType) : "video",
    actorId: body.actorId ? String(body.actorId) : "system-owner",
    actorType: body.actorType ? String(body.actorType) : "system",
    format: body.format ? String(body.format) : undefined,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
