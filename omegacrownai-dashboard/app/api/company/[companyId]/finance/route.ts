import { NextResponse } from "next/server";
import { getFinanceDashboard } from "@/lib/sugent/finance/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const dashboard = await getFinanceDashboard(companyId);

  return NextResponse.json(dashboard);
}
