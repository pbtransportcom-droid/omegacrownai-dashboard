import { NextResponse } from "next/server";

const onboardingCampaign = {
  phase: "v5.8 Phase 79",
  name: "Customer Rollout + Onboarding Campaign",
  status: "ready",
  milestones: [
    {
      id: "account_setup",
      label: "Account setup",
      owner: "Customer success",
      successCriteria: "Customer can sign in, access workspace, and complete organization profile."
    },
    {
      id: "billing_ready",
      label: "Billing ready",
      owner: "Operations",
      successCriteria: "Customer has an active plan or approved billing path."
    },
    {
      id: "provider_activation",
      label: "Provider activation",
      owner: "Customer success",
      successCriteria: "Customer connects required publishing, AI, storage, or payment providers."
    },
    {
      id: "first_project",
      label: "First project",
      owner: "Customer success",
      successCriteria: "Customer creates first project and generates usable output."
    },
    {
      id: "first_publish_or_export",
      label: "First publish or export",
      owner: "Customer success",
      successCriteria: "Customer completes first approved publish, export, or production-ready workflow."
    },
    {
      id: "success_review",
      label: "Success review",
      owner: "Founder/operator",
      successCriteria: "Customer value, blockers, support needs, and expansion path are documented."
    }
  ],
  rolloutControls: {
    pauseCriteria: [
      "SEV1 incident",
      "Billing checkout failure",
      "Authentication outage",
      "Provider-wide publishing failure",
      "Customer data exposure concern",
      "Repeated onboarding blocker affecting multiple customers"
    ],
    expansionCriteria: [
      "Successful pilot onboarding",
      "Stable billing flow",
      "Provider activation success",
      "Support load remains manageable",
      "No unresolved SEV1 or material SEV2 incident"
    ]
  }
};

export async function GET() {
  return NextResponse.json(onboardingCampaign, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
