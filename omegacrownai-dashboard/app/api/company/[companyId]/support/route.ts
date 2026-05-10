import { NextResponse } from "next/server";
import { getSupportDashboard } from "@/lib/sugent/support/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const dashboard = await getSupportDashboard(companyId);

  return NextResponse.json(dashboard);
}
