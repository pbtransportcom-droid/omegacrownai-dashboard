import { NextResponse } from "next/server";
import { inviteCustomerTeamMember } from "@/lib/sugent/customer-team/customerTeamEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.email) {
    return NextResponse.json({ ok: false, error: "email is required" }, { status: 400 });
  }

  const result = await inviteCustomerTeamMember({
    organizationId,
    email: String(body.email),
    role: body.role ? String(body.role) : "viewer",
    invitedByUserId: body.invitedByUserId ? String(body.invitedByUserId) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
