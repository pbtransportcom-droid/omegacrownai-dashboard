import { NextResponse } from "next/server";
import { liftCustomerAbuseControl } from "@/lib/sugent/customer-admin/customerAdminEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ controlId: string }> }
) {
  const { controlId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await liftCustomerAbuseControl({
    controlId,
    liftedByAdminId: body.liftedByAdminId ? String(body.liftedByAdminId) : "system-admin",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
