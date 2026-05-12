import { NextResponse } from "next/server";
import { rollbackDeployment } from "@/lib/sugent/deployment/deploymentEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string; releaseId: string }> }
) {
  const { companyId, releaseId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await rollbackDeployment({
    companyId,
    releaseId,
    toReleaseId: body.toReleaseId ? String(body.toReleaseId) : null,
    reason: body.reason ? String(body.reason) : "Manual sovereign rollback.",
    actorId: body.actorId ? String(body.actorId) : "system-owner",
    actorType: body.actorType ? String(body.actorType) : "system",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
