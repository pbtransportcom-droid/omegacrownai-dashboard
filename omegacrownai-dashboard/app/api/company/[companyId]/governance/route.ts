import { NextResponse } from "next/server";
import { listGovernanceDashboard } from "@/lib/sugent/governance/governanceEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await listGovernanceDashboard(companyId);

  return NextResponse.json(result);
}
