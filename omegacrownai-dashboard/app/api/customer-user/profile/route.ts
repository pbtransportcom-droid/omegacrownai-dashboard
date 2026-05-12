import { NextResponse } from "next/server";
import { updateCustomerProfile } from "@/lib/sugent/customer-dashboard/customerDashboardEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const result = await updateCustomerProfile({
    userId: body.userId ? String(body.userId) : null,
    email: body.email ? String(body.email) : null,
    name: body.name ? String(body.name) : null,
    timezone: body.timezone ? String(body.timezone) : null,
    locale: body.locale ? String(body.locale) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
