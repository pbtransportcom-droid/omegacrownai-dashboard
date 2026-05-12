import { NextResponse } from "next/server";
import { createCustomerAbuseControl } from "@/lib/sugent/customer-admin/customerAdminEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.controlType) {
    return NextResponse.json({ ok: false, error: "controlType is required" }, { status: 400 });
  }

  const result = await createCustomerAbuseControl({
    organizationId: body.organizationId ? String(body.organizationId) : null,
    userId: body.userId ? String(body.userId) : null,
    companyId: body.companyId ? String(body.companyId) : null,
    controlType: String(body.controlType),
    reason: body.reason ? String(body.reason) : null,
    severity: body.severity ? String(body.severity) : "warning",
    createdByAdminId: body.createdByAdminId ? String(body.createdByAdminId) : "system-admin",
  });

  return NextResponse.json(result);
}
