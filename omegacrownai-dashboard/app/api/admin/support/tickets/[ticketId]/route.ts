import { NextResponse } from "next/server";
import { updateCustomerSupportTicket } from "@/lib/sugent/customer-admin/customerAdminEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await updateCustomerSupportTicket({
    ticketId,
    status: body.status ? String(body.status) : null,
    priority: body.priority ? String(body.priority) : null,
    assignedToAdminId: body.assignedToAdminId ? String(body.assignedToAdminId) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
