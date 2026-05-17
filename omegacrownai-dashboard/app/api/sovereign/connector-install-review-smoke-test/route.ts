import { NextResponse } from "next/server";
import { getConnectorInstallReview } from "@/lib/sovereign/connector-install-review";

const requiredSections = [
  "Connector identity",
  "Permission review",
  "Risk review",
  "Action review",
  "Credential safety",
  "Healthcheck and disconnect",
  "Blocked action review",
];

const requiredDecisionStates = [
  "ready_for_review",
  "validation_failed",
  "approval_required",
  "approved_for_install",
  "installed_limited",
  "installed_active",
  "blocked",
];

export async function GET() {
  const review = getConnectorInstallReview();

  const sectionNames = review.reviewSections.map((item) => item.section);
  const stateNames = review.installDecisionStates.map((item) => item.state);

  const missingSections = requiredSections.filter((item) => !sectionNames.includes(item));
  const missingStates = requiredDecisionStates.filter((item) => !stateNames.includes(item));

  const checks = [
    {
      name: "Install review is ready",
      passed: review.status === "install_review_ready",
      detail: review.status,
    },
    {
      name: "Sample connector validates",
      passed: review.sampleConnector.validationOk === true,
      detail: `score ${review.sampleConnector.validationScore}`,
    },
    {
      name: "Review sections present",
      passed: missingSections.length === 0,
      detail: missingSections.length
        ? `Missing: ${missingSections.join(", ")}`
        : "All required review sections present.",
    },
    {
      name: "Install decision states present",
      passed: missingStates.length === 0,
      detail: missingStates.length
        ? `Missing: ${missingStates.join(", ")}`
        : "All required install states present.",
    },
    {
      name: "Admin checklist present",
      passed: review.adminChecklist.length >= 10,
      detail: `${review.adminChecklist.length} checklist items`,
    },
    {
      name: "UI requirements present",
      passed: review.uiRequirements.length >= 9,
      detail: `${review.uiRequirements.length} UI requirements`,
    },
    {
      name: "Marketplace install flow linked",
      passed: review.marketplaceInstallFlow.length >= 8,
      detail: `${review.marketplaceInstallFlow.length} install workflow steps`,
    },
    {
      name: "Blocked connector actions visible",
      passed: review.blockedConnectorActions.length >= 6,
      detail: `${review.blockedConnectorActions.length} blocked connector actions`,
    },
    {
      name: "API links present",
      passed: review.apiLinks.length >= 4,
      detail: `${review.apiLinks.length} API links`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v17.6 Phase 196",
    service: "Connector Install Review Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    reviewSectionCount: review.reviewSections.length,
    decisionStateCount: review.installDecisionStates.length,
    adminChecklistCount: review.adminChecklist.length,
    uiRequirementCount: review.uiRequirements.length,
    blockedConnectorActionCount: review.blockedConnectorActions.length,
    apiLinkCount: review.apiLinks.length,
    sampleValidationScore: review.sampleConnector.validationScore,
    checks,
  });
}
