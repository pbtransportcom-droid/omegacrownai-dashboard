import { NextResponse } from "next/server";
import { executeSovereignPublish } from "@/lib/sugent/publish/sovereignPublishEngine";

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

  const result = await executeSovereignPublish({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    projectId: String(body.projectId),
    projectType: body.projectType ? String(body.projectType) : "video",
    channel: body.channel ? String(body.channel) : "internal",
    actorId: body.actorId ? String(body.actorId) : "system-owner",
    actorType: body.actorType ? String(body.actorType) : "system",
    metadata: body.metadata || {},
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
