import { NextResponse } from "next/server";
import { getStripeBillingDashboard } from "@/lib/sugent/stripe-billing/stripeBillingEngine";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const result = await getStripeBillingDashboard(url.searchParams.get("organizationId"));
  return NextResponse.json(result);
}
