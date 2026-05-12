import { NextResponse } from "next/server";
import { createReleaseBundle } from "@/lib/sugent/deployment/deploymentEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await createReleaseBundle({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    profileId: body.profileId ? String(body.profileId) : null,
    name: body.name ? String(body.name) : null,
    version: body.version ? String(body.version) : null,
    sourceRef: body.sourceRef ? String(body.sourceRef) : "main",
    commitHash: body.commitHash ? String(body.commitHash) : "local",
    actorId: body.actorId ? String(body.actorId) : "system-owner",
    actorType: body.actorType ? String(body.actorType) : "system",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 403,
  });
}
