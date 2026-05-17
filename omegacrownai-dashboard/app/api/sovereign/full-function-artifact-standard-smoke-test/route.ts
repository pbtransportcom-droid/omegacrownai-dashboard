import { NextResponse } from "next/server";
import { getFullFunctionArtifactStandard } from "@/lib/sovereign/full-function-artifact-standard";

const requiredCoreRequirements = [
  "Frontend output",
  "Backend/API output",
  "Preview/review path",
  "Download/export",
  "README/run instructions",
  "Smoke test/validation",
  "Missing information checker",
  "Deployment checklist",
  "Next action",
];

const requiredBuilders = [
  "Website / App Builder",
  "Trading Builder",
  "Automation Builder",
  "Coding Builder",
  "Creative / Marketing Builder",
];

export async function GET() {
  const standard = getFullFunctionArtifactStandard();

  const requirementNames = standard.coreRequirements.map((item) => item.name);
  const builderNames = standard.builderStandards.map((item) => item.builder);

  const missingRequirements = requiredCoreRequirements.filter(
    (item) => !requirementNames.includes(item)
  );

  const missingBuilders = requiredBuilders.filter(
    (item) => !builderNames.includes(item)
  );

  const checks = [
    {
      name: "Standard is ready",
      passed: standard.status === "standard_ready",
      detail: standard.status,
    },
    {
      name: "90–110% delivery target exists",
      passed:
        standard.deliveryTarget.minimumCustomerReady === "90%" &&
        standard.deliveryTarget.eliteAboveCompetitor === "110%",
      detail: `${standard.deliveryTarget.minimumCustomerReady} to ${standard.deliveryTarget.eliteAboveCompetitor}`,
    },
    {
      name: "All core requirements present",
      passed: missingRequirements.length === 0,
      detail: missingRequirements.length
        ? `Missing: ${missingRequirements.join(", ")}`
        : "All core requirements present.",
    },
    {
      name: "Builder standards present",
      passed: missingBuilders.length === 0,
      detail: missingBuilders.length
        ? `Missing: ${missingBuilders.join(", ")}`
        : "All required builder standards present.",
    },
    {
      name: "Scoring rubric present",
      passed: standard.scoringRubric.length >= 5,
      detail: `${standard.scoringRubric.length} scoring levels`,
    },
    {
      name: "Non-negotiable rules present",
      passed: standard.nonNegotiableRules.length >= 7,
      detail: `${standard.nonNegotiableRules.length} rules`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v16.7 Phase 187",
    service: "Full-Function Artifact Standard Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    coreRequirementCount: standard.coreRequirements.length,
    builderStandardCount: standard.builderStandards.length,
    scoringLevelCount: standard.scoringRubric.length,
    ruleCount: standard.nonNegotiableRules.length,
    checks,
  });
}
