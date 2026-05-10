import { NextResponse } from "next/server";
import { getSalesDashboard } from "@/lib/sugent/sales/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const dashboard = await getSalesDashboard(companyId);

  return NextResponse.json(dashboard);
}
