import { NextResponse } from "next/server";
import { upsertCustomerPermissionOverride } from "@/lib/sugent/customer-team/customerTeamEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.resourceType || !body.action) {
    return NextResponse.json(
      { ok: false, error: "resourceType and action are required" },
      { status: 400 }
    );
  }

  const result = await upsertCustomerPermissionOverride({
    organizationId,
    userId: body.userId ? String(body.userId) : null,
    resourceType: String(body.resourceType),
    resourceId: body.resourceId ? String(body.resourceId) : null,
    action: String(body.action),
    effect: body.effect ? String(body.effect) : "allow",
    reason: body.reason ? String(body.reason) : null,
    createdByUserId: body.createdByUserId ? String(body.createdByUserId) : null,
  });

  return NextResponse.json(result);
}
