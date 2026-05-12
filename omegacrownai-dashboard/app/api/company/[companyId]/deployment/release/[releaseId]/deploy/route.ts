import { NextResponse } from "next/server";
import { deployReleaseBundle } from "@/lib/sugent/deployment/deploymentEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string; releaseId: string }> }
) {
  const { companyId, releaseId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await deployReleaseBundle({
    companyId,
    releaseId,
    actorId: body.actorId ? String(body.actorId) : "system-owner",
    actorType: body.actorType ? String(body.actorType) : "system",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
