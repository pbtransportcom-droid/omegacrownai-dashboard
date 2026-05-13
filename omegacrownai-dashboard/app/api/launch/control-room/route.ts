import { NextResponse } from "next/server";

const controlRoom = {
  phase: "v5.9 Phase 80",
  name: "Production Launch Control Room",
  status: "ready",
  launchCommander: {
    role: "Launch commander",
    responsibility:
      "Own go/no-go decision, production rollout pace, incident escalation, rollback authorization, and customer-impact communication."
  },
  readiness: [
    {
      area: "Legal and compliance",
      status: "ready",
      required: true,
      detail:
        "Production legal pages are in place for Terms, Privacy, DPA, refund policy, billing policy, cookie notice, and provider disclosure."
    },
    {
      area: "Monitoring and incident response",
      status: "ready",
      required: true,
      detail:
        "Health checks, monitoring alerts, incident intake, and response runbook are in place."
    },
    {
      area: "Customer rollout and onboarding",
      status: "ready",
      required: true,
      detail:
        "Customer rollout plan and onboarding campaign are in place for controlled launch."
    },
    {
      area: "Billing",
      status: "conditional",
      required: true,
      detail:
        "Billing foundation is present. Final checkout validation depends on real Stripe test/live keys."
    },
    {
      area: "Provider activation",
      status: "ready",
      required: true,
      detail:
        "Premium provider activation and publishing provider activation are ready for controlled launch."
    }
  ],
  launchDecision: {
    defaultDecision: "controlled_go",
    constraints: [
      "Use controlled rollout instead of unrestricted launch.",
      "Pause rollout on SEV1.",
      "Pause rollout on billing, auth, data exposure, or provider-wide publishing failure.",
      "Do not advance to Phase 81 until Phase 80 commit is pushed."
    ]
  }
};

export async function GET() {
  return NextResponse.json(controlRoom, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
