import { NextResponse } from "next/server";
import { startCustomerOnboarding } from "@/lib/sugent/customer-onboarding/customerOnboardingEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.email) {
    return NextResponse.json(
      { ok: false, error: "email is required" },
      { status: 400 }
    );
  }

  const result = await startCustomerOnboarding({
    email: String(body.email),
    name: body.name ? String(body.name) : null,
    organizationName: body.organizationName ? String(body.organizationName) : null,
    selectedPlanTier: body.selectedPlanTier ? String(body.selectedPlanTier) : "starter",
    paymentMode: body.paymentMode ? String(body.paymentMode) : "manual",
    password: body.password ? String(body.password) : null,
  });

  return NextResponse.json(result);
}
