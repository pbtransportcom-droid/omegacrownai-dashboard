import { NextResponse } from "next/server";
import { getCustomerTeamDashboard } from "@/lib/sugent/customer-team/customerTeamEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const result = await getCustomerTeamDashboard(organizationId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
