import { NextResponse } from "next/server";
import { getSovereignRepairDashboard } from "@/lib/sugent/sovereign-repair/sovereignRepairEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getSovereignRepairDashboard(companyId);

  return NextResponse.json(result);
}
