import { NextResponse } from "next/server";
import { getOperationsDashboard } from "@/lib/sugent/operations/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const dashboard = await getOperationsDashboard(companyId);

  return NextResponse.json(dashboard);
}
