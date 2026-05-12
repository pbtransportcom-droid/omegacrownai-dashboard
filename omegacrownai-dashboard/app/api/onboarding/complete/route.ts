import { NextResponse } from "next/server";
import { completeCustomerOnboarding } from "@/lib/sugent/customer-onboarding/customerOnboardingEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.onboardingId) {
    return NextResponse.json(
      { ok: false, error: "onboardingId is required" },
      { status: 400 }
    );
  }

  const result = await completeCustomerOnboarding({
    onboardingId: String(body.onboardingId),
    companyId: body.companyId ? String(body.companyId) : null,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    starterProjectId: body.starterProjectId ? String(body.starterProjectId) : null,
  });

  return NextResponse.json(result);
}
