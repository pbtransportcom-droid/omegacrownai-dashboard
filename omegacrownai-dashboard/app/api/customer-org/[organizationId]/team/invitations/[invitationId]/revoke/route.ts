import { NextResponse } from "next/server";
import { revokeCustomerTeamInvitation } from "@/lib/sugent/customer-team/customerTeamEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string; invitationId: string }> }
) {
  const { invitationId } = await params;
  const result = await revokeCustomerTeamInvitation(invitationId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
