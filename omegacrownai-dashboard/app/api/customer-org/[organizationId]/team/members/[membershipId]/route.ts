import { NextResponse } from "next/server";
import { updateCustomerMembershipRole } from "@/lib/sugent/customer-team/customerTeamEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string; membershipId: string }> }
) {
  const { membershipId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await updateCustomerMembershipRole({
    membershipId,
    role: body.role ? String(body.role) : null,
    status: body.status ? String(body.status) : null,
    actorUserId: body.actorUserId ? String(body.actorUserId) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
