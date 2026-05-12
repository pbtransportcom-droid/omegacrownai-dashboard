import { NextResponse } from "next/server";
import { issueCompanyPassport } from "@/lib/sugent/passport/passportEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await issueCompanyPassport({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    issuedBy: body.issuedBy ? String(body.issuedBy) : "passport-api",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
