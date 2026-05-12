import { NextResponse } from "next/server";
import { getAuditDashboard } from "@/lib/sugent/audit/auditEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getAuditDashboard(companyId);

  return NextResponse.json(result);
}
