import { NextResponse } from "next/server";

type LaunchSignal = {
  legalReady?: boolean;
  monitoringReady?: boolean;
  onboardingReady?: boolean;
  billingReady?: boolean;
  providersReady?: boolean;
  activeSev1?: boolean;
  activeSev2?: boolean;
  launchCommanderApproved?: boolean;
};

function evaluate(signal: LaunchSignal) {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!signal.legalReady) blockers.push("Legal and compliance pages are not confirmed ready.");
  if (!signal.monitoringReady) blockers.push("Monitoring and incident response are not confirmed ready.");
  if (!signal.onboardingReady) blockers.push("Customer rollout and onboarding are not confirmed ready.");
  if (!signal.providersReady) blockers.push("Provider activation is not confirmed ready.");
  if (signal.activeSev1) blockers.push("Active SEV1 incident blocks production launch.");
  if (!signal.launchCommanderApproved) blockers.push("Launch commander approval is required.");

  if (!signal.billingReady) {
    warnings.push("Billing is not confirmed fully ready; launch must remain controlled or test-only.");
  }

  if (signal.activeSev2) {
    warnings.push("Active SEV2 incident requires launch commander risk acceptance.");
  }

  return {
    decision: blockers.length > 0 ? "no_go" : warnings.length > 0 ? "conditional_go" : "go",
    blockers,
    warnings
  };
}

export async function GET() {
  return NextResponse.json({
    phase: "v5.9 Phase 80",
    service: "OmegaCrownAI launch go/no-go evaluator",
    usage: "POST launch readiness signals to receive go, conditional_go, or no_go decision.",
    requiredSignals: [
      "legalReady",
      "monitoringReady",
      "onboardingReady",
      "billingReady",
      "providersReady",
      "activeSev1",
      "activeSev2",
      "launchCommanderApproved"
    ]
  });
}

export async function POST(request: Request) {
  let signal: LaunchSignal;

  try {
    signal = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid JSON payload"
      },
      { status: 400 }
    );
  }

  const evaluation = evaluate(signal);

  return NextResponse.json({
    ok: true,
    phase: "v5.9 Phase 80",
    evaluatedAt: new Date().toISOString(),
    ...evaluation
  });
}
