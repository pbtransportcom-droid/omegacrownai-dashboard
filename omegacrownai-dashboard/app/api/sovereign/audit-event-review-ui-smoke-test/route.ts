import { NextResponse } from "next/server";
import { getAuditEventReviewUiBlueprint } from "@/lib/sovereign/audit-event-review-ui";

const requiredPanels = [
  "Audit Timeline",
  "Filter Controls",
  "Evidence Drawer",
  "Correlation Replay",
  "Approval and Blocked Actions",
  "Export / Review Path",
];

const requiredFilters = [
  "eventType",
  "actor",
  "role",
  "source",
  "riskLevel",
  "decision",
  "status",
  "correlationId",
  "createdFrom",
  "createdTo",
];

const requiredDisplayRules = [
  "Always show redaction badge.",
  "Never render raw secrets, tokens, passwords, API keys, authorization headers, or private keys.",
  "Show blocked_by_default risk with critical styling.",
  "Show correlation id as a replay link.",
  "Show export as redacted export only.",
];

export async function GET() {
  const reviewUi = getAuditEventReviewUiBlueprint();

  const panelNames = reviewUi.reviewPanels.map((panel) => panel.panel);

  const missingPanels = requiredPanels.filter((panel) => !panelNames.includes(panel));
  const missingFilters = requiredFilters.filter((filter) => !reviewUi.filters.includes(filter));
  const missingDisplayRules = requiredDisplayRules.filter(
    (rule) => !reviewUi.displayRules.includes(rule)
  );

  const checks = [
    {
      name: "Audit review UI blueprint is ready",
      passed: reviewUi.status === "audit_review_ui_blueprint_ready",
      detail: reviewUi.status,
    },
    {
      name: "Required review panels present",
      passed: missingPanels.length === 0,
      detail: missingPanels.length ? `Missing: ${missingPanels.join(", ")}` : "All panels present.",
    },
    {
      name: "Audit card shape present",
      passed: Boolean(
        reviewUi.auditCardShape.auditId &&
          reviewUi.auditCardShape.correlationId &&
          reviewUi.auditCardShape.redacted
      ),
      detail: "Audit card shape defined.",
    },
    {
      name: "Required filters present",
      passed: missingFilters.length === 0,
      detail: missingFilters.length ? `Missing: ${missingFilters.join(", ")}` : "All filters present.",
    },
    {
      name: "Display rules present",
      passed: missingDisplayRules.length === 0,
      detail: missingDisplayRules.length
        ? `Missing: ${missingDisplayRules.join(", ")}`
        : "Core display rules present.",
    },
    {
      name: "Sample timeline cards present",
      passed:
        reviewUi.sampleTimelineCards.length >= 3 &&
        reviewUi.sampleTimelineCards.every((card) => card.redacted === true),
      detail: `${reviewUi.sampleTimelineCards.length} sample cards`,
    },
    {
      name: "Export package excludes secrets",
      passed:
        reviewUi.sampleExportPackage.excludes.includes("raw tokens") &&
        reviewUi.sampleExportPackage.excludes.includes("API keys") &&
        reviewUi.sampleExportPackage.excludes.includes("authorization headers"),
      detail: "Secret exclusions present.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v18.7 Phase 207",
    service: "Audit Event Review UI Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    reviewPanelCount: reviewUi.reviewPanels.length,
    filterCount: reviewUi.filters.length,
    displayRuleCount: reviewUi.displayRules.length,
    sampleCardCount: reviewUi.sampleTimelineCards.length,
    exportIncludeCount: reviewUi.sampleExportPackage.includes.length,
    exportExcludeCount: reviewUi.sampleExportPackage.excludes.length,
    checks,
  });
}
