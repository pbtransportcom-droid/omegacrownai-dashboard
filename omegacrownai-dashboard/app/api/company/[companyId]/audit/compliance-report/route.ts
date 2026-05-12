import { NextResponse } from "next/server";
import { createComplianceReport } from "@/lib/sugent/audit/auditEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await createComplianceReport({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    generatedBy: body.generatedBy ? String(body.generatedBy) : "system",
  });

  return NextResponse.json(result);
}
