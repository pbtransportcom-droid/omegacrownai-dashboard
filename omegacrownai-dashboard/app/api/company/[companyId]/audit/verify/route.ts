import { NextResponse } from "next/server";
import { verifyAuditChain } from "@/lib/sugent/audit/auditEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await verifyAuditChain(companyId);

  return NextResponse.json(result);
}
