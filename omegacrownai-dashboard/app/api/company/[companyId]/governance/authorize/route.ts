import { NextResponse } from "next/server";
import { authorizeGovernanceAction } from "@/lib/sugent/governance/governanceEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.resource || !body.action) {
    return NextResponse.json(
      { ok: false, error: "resource and action are required" },
      { status: 400 }
    );
  }

  const result = await authorizeGovernanceAction({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    actorId: body.actorId ? String(body.actorId) : "system-owner",
    actorType: body.actorType ? String(body.actorType) : "system",
    resource: String(body.resource),
    action: String(body.action),
    metadata: body.metadata || {},
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 403,
  });
}
