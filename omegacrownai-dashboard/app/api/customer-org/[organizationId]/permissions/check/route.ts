import { NextResponse } from "next/server";
import { checkCustomerPermission } from "@/lib/sugent/customer-team/customerTeamEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.userId || !body.permission) {
    return NextResponse.json(
      { ok: false, error: "userId and permission are required" },
      { status: 400 }
    );
  }

  const result = await checkCustomerPermission({
    organizationId,
    userId: String(body.userId),
    permission: String(body.permission),
    resourceType: body.resourceType ? String(body.resourceType) : "organization",
    resourceId: body.resourceId ? String(body.resourceId) : null,
  });

  return NextResponse.json(result);
}
