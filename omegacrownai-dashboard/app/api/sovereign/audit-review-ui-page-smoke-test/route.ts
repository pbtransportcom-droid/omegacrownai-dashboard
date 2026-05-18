import { NextResponse } from "next/server";
import { getAuditReviewUiPage } from "@/lib/sovereign/audit-review-ui-page";

const requiredSections = [
  "Audit Overview Header",
  "Audit Filter Panel",
  "Audit Timeline Cards",
  "Evidence Review Panel",
  "Correlation Replay Actions",
  "Approval / Blocked Markers",
  "Export / Review Actions",
];

const requiredBadges = [
  "redacted",
  "safe evidence only",
  "approval required",
  "blocked",
  "blocked by default",
  "correlation replay",
  "export ready",
];

const requiredNoSecretRules = [
  "Never display raw OAuth tokens.",
  "Never display API keys.",
  "Never display passwords.",
  "Never display bearer authorization headers.",
  "Never display private keys.",
  "Never display webhook secrets.",
];

export async function GET() {
  const page = getAuditReviewUiPage();

  const sectionNames = page.pageSections.map((item) => item.section);
  const missingSections = requiredSections.filter((item) => !sectionNames.includes(item));
  const missingBadges = requiredBadges.filter((item) => !page.uiBadges.includes(item));
  const missingNoSecretRules = requiredNoSecretRules.filter(
    (item) => !page.noSecretDisplayRules.includes(item)
  );

  const checks = [
    {
      name: "Audit review UI page is ready",
      passed: page.status === "audit_review_ui_page_ready",
      detail: page.status,
    },
    {
      name: "Audit route is defined",
      passed: page.route === "/audit",
      detail: page.route,
    },
    {
      name: "Required page sections present",
      passed: missingSections.length === 0,
      detail: missingSections.length ? `Missing: ${missingSections.join(", ")}` : "All sections present.",
    },
    {
      name: "Filters present",
      passed: page.filters.length >= 10,
      detail: `${page.filters.length} filters`,
    },
    {
      name: "Sample audit cards present and redacted",
      passed: page.sampleCards.length >= 3 && page.sampleCards.every((card) => card.redacted === true),
      detail: `${page.sampleCards.length} redacted cards`,
    },
    {
      name: "UI badges present",
      passed: missingBadges.length === 0,
      detail: missingBadges.length ? `Missing: ${missingBadges.join(", ")}` : "All badges present.",
    },
    {
      name: "API links present",
      passed: page.apiLinks.length >= 5,
      detail: `${page.apiLinks.length} API links`,
    },
    {
      name: "No-secret display rules present",
      passed: missingNoSecretRules.length === 0,
      detail: missingNoSecretRules.length
        ? `Missing: ${missingNoSecretRules.join(", ")}`
        : "Core no-secret display rules present.",
    },
    {
      name: "Integration source statuses present",
      passed:
        page.integrationSources.reviewUiStatus === "audit_review_ui_blueprint_ready" &&
        page.integrationSources.queryPersistenceStatus === "audit_query_persistence_blueprint_ready" &&
        page.integrationSources.replayStatus === "correlation_replay_blueprint_ready",
      detail: "Integration sources linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v19.4 Phase 214",
    service: "Audit Review UI Page Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    pageSectionCount: page.pageSections.length,
    filterCount: page.filters.length,
    sampleCardCount: page.sampleCards.length,
    badgeCount: page.uiBadges.length,
    apiLinkCount: page.apiLinks.length,
    noSecretRuleCount: page.noSecretDisplayRules.length,
    checks,
  });
}
