import { NextResponse } from "next/server";
import { createGovernanceRoleAssignment } from "@/lib/sugent/governance/governanceEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.roleSlug || !body.actorId) {
    return NextResponse.json(
      { ok: false, error: "roleSlug and actorId are required" },
      { status: 400 }
    );
  }

  const result = await createGovernanceRoleAssignment({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    roleSlug: String(body.roleSlug),
    actorId: String(body.actorId),
    actorType: body.actorType ? String(body.actorType) : "system",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
