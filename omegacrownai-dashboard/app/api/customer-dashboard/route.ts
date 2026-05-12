import { NextResponse } from "next/server";
import { getCustomerDashboardByEmail } from "@/lib/sugent/customer-dashboard/customerDashboardEngine";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "email query parameter is required" },
      { status: 400 }
    );
  }

  const result = await getCustomerDashboardByEmail(email);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
