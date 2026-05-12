import { NextResponse } from "next/server";
import { issueProjectPassport } from "@/lib/sugent/passport/passportEngine";

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

  const result = await issueProjectPassport({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    projectId: String(body.projectId),
    projectType: body.projectType === "podcast" ? "podcast" : "video",
    issuedBy: body.issuedBy ? String(body.issuedBy) : "passport-api",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
