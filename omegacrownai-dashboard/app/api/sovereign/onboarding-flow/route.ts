import { NextResponse } from "next/server";

const steps = [
  {
    step: 1,
    key: "account",
    title: "Login or Sign Up",
    href: "/login",
    status: "ready",
  },
  {
    step: 2,
    key: "department",
    title: "Choose a Sovereign department",
    href: "/build",
    status: "ready",
  },
  {
    step: 3,
    key: "project",
    title: "Start Department Project",
    href: "/sovereign/website",
    status: "ready",
  },
  {
    step: 4,
    key: "workspace",
    title: "Open routed workspace",
    href: "/api/sovereign/button-flow-matrix",
    status: "ready",
  },
  {
    step: 5,
    key: "readiness",
    title: "Verify release readiness",
    href: "/api/sovereign/release-readiness",
    status: "ready",
  },
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    phase: "v13.1 Phase 151",
    service: "Sovereign Customer Onboarding Start Flow",
    totalSteps: steps.length,
    readySteps: steps.filter((step) => step.status === "ready").length,
    recommendedPath:
      "Login or sign up, choose a department, start a project, open the routed workspace, then verify release readiness.",
    steps,
  });
}
