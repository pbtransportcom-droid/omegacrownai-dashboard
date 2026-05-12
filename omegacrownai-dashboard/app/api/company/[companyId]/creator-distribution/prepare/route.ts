import { NextResponse } from "next/server";
import { createCreatorDistribution } from "@/lib/sugent/distribution/creatorDistributionEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.exportId) {
    return NextResponse.json(
      { ok: false, error: "exportId is required" },
      { status: 400 }
    );
  }

  const result = await createCreatorDistribution({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    exportId: String(body.exportId),
    channel: body.channel ? String(body.channel) : "public_share",
    createdBy: body.createdBy ? String(body.createdBy) : "system-owner",
    actorType: body.actorType ? String(body.actorType) : "system",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
