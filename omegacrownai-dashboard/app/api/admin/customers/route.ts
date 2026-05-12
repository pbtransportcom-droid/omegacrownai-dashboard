import { NextResponse } from "next/server";
import { getCustomerAdminDashboard } from "@/lib/sugent/customer-admin/customerAdminEngine";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const result = await getCustomerAdminDashboard({
    q: url.searchParams.get("q"),
  });

  return NextResponse.json(result);
}
