import { NextResponse } from "next/server";
import { createCustomerSupportTicket } from "@/lib/sugent/customer-admin/customerAdminEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.subject) {
    return NextResponse.json({ ok: false, error: "subject is required" }, { status: 400 });
  }

  const result = await createCustomerSupportTicket({
    organizationId: body.organizationId ? String(body.organizationId) : null,
    userId: body.userId ? String(body.userId) : null,
    companyId: body.companyId ? String(body.companyId) : null,
    subject: String(body.subject),
    description: body.description ? String(body.description) : null,
    category: body.category ? String(body.category) : "technical",
    priority: body.priority ? String(body.priority) : "normal",
    metadata: body.metadata || {},
  });

  return NextResponse.json(result);
}
