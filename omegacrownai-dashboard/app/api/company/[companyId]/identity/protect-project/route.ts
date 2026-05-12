import { NextResponse } from "next/server";
import { protectProjectAssets } from "@/lib/sugent/identity/platformIdentityEngine";

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

  const result = await protectProjectAssets({
    companyId,
    projectId: String(body.projectId),
    projectType: body.projectType === "podcast" ? "podcast" : "video",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
