import { NextResponse } from "next/server";
import { seedPremiumProviderAdapters } from "@/lib/sugent/premium-provider-activation/premiumProviderActivationEngine";

export async function POST() {
  const result = await seedPremiumProviderAdapters();
  return NextResponse.json(result);
}
