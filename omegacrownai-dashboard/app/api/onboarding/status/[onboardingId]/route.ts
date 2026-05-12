import { NextResponse } from "next/server";
import { getCustomerOnboardingStatus } from "@/lib/sugent/customer-onboarding/customerOnboardingEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ onboardingId: string }> }
) {
  const { onboardingId } = await params;
  const result = await getCustomerOnboardingStatus(onboardingId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
