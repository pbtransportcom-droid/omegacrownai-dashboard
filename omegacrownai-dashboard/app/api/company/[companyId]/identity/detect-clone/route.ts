import { NextResponse } from "next/server";
import { detectCloneByHash } from "@/lib/sugent/identity/platformIdentityEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.suspectedHash) {
    return NextResponse.json(
      { ok: false, error: "suspectedHash is required" },
      { status: 400 }
    );
  }

  const result = await detectCloneByHash({
    companyId,
    suspectedHash: String(body.suspectedHash),
    projectId: body.projectId ? String(body.projectId) : null,
    assetId: body.assetId ? String(body.assetId) : null,
  });

  return NextResponse.json(result);
}
