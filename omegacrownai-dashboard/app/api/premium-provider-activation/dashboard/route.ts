import { NextResponse } from "next/server";
import { getPremiumProviderActivationDashboard } from "@/lib/sugent/premium-provider-activation/premiumProviderActivationEngine";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const result = await getPremiumProviderActivationDashboard(url.searchParams.get("organizationId"));
  return NextResponse.json(result);
}
