import { NextResponse } from "next/server";
import { getPublicMarketingData, seedPublicPricingPlans } from "@/lib/sugent/marketing/publicMarketingEngine";

export async function GET() {
  const result = await getPublicMarketingData();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await seedPublicPricingPlans();
  return NextResponse.json(result);
}
