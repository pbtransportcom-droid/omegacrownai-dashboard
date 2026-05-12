import { NextResponse } from "next/server";
import { getMarketingLeadDashboard } from "@/lib/sugent/marketing/publicMarketingEngine";

export async function GET() {
  const result = await getMarketingLeadDashboard();
  return NextResponse.json(result);
}
