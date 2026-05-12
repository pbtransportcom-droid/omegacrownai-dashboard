import { NextResponse } from "next/server";
import { runSovereignPolicyRepair } from "@/lib/sugent/sovereign-repair/sovereignRepairEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await runSovereignPolicyRepair({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    projectId: body.projectId ? String(body.projectId) : null,
    projectType: body.projectType ? String(body.projectType) : "video",
    actorId: body.actorId ? String(body.actorId) : "system-owner",
    actorType: body.actorType ? String(body.actorType) : "system",
    resource: body.resource ? String(body.resource) : "runtime",
    action: body.action ? String(body.action) : "publish",
    failedChecks: Array.isArray(body.failedChecks) ? body.failedChecks.map(String) : undefined,
    triggerType: body.triggerType ? String(body.triggerType) : "manual",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
