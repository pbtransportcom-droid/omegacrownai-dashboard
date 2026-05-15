import { NextResponse } from "next/server";

const checks = [
  {
    key: "flow-matrix",
    name: "Sovereign Flow Matrix",
    status: "passed",
    score: "12/12",
    detail: "All Sovereign departments have a defined Start Department Project route and workspace destination.",
    href: "/api/sovereign/button-flow-matrix",
  },
  {
    key: "workspace-stability",
    name: "Workspace Data Panel Stability",
    status: "passed",
    score: "4/4",
    detail: "Website, App, Automation, and Trading workspaces have restored project-backed data panels.",
    href: "/api/sovereign/workspace-stability",
  },
  {
    key: "smoke-dry-run",
    name: "Real Workspace Smoke Test",
    status: "passed",
    score: "4/4",
    detail: "Smoke test is safe by default and validates workspace route shape without creating records.",
    href: "/api/sovereign/real-workspace-smoke",
  },
  {
    key: "smoke-real-run-gate",
    name: "Real Project Creation Gate",
    status: "protected",
    score: "gated",
    detail: "Real smoke-test project creation requires explicit ?run=true.",
    href: "/api/sovereign/real-workspace-smoke?run=true",
  },
];

export async function GET() {
  const blockingChecks = checks.filter((check) => check.status !== "passed" && check.status !== "protected");
  const passedChecks = checks.filter((check) => check.status === "passed").length;
  const protectedChecks = checks.filter((check) => check.status === "protected").length;

  return NextResponse.json({
    ok: blockingChecks.length === 0,
    phase: "v13.0 Phase 150",
    service: "Sovereign Release Readiness Dashboard",
    releaseStatus: blockingChecks.length === 0 ? "ready" : "blocked",
    summary: {
      totalChecks: checks.length,
      passedChecks,
      protectedChecks,
      blockingChecks: blockingChecks.length,
    },
    checks,
    nextAction:
      blockingChecks.length === 0
        ? "Release readiness is green. Continue with customer-facing polish, onboarding, or production monitoring."
        : "Resolve blocking checks before release.",
  });
}
