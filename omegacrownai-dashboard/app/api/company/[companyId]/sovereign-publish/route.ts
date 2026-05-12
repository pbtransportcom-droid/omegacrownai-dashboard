import { NextResponse } from "next/server";
import { getSovereignPublishDashboard } from "@/lib/sugent/publish/sovereignPublishEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getSovereignPublishDashboard(companyId);

  return NextResponse.json(result);
}
