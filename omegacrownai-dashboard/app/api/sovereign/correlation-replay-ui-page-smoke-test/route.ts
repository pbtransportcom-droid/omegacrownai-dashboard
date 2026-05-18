import { NextResponse } from "next/server";
import { getCorrelationReplayUiPage } from "@/lib/sovereign/correlation-replay-ui-page";

const requiredSections = [
  "Replay Header",
  "Workflow Summary",
  "Event Sequence Timeline",
  "Evidence Chain",
  "Approval / Blocked Markers",
  "Recovery / Rollback Panel",
  "Redacted Export Panel",
];

const requiredBadges = [
  "correlation id",
  "redacted replay",
  "safe evidence",
  "approval required",
  "blocked marker",
  "rollback context",
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
  const page = getCorrelationReplayUiPage();

  const sectionNames = page.pageSections.map((item) => item.section);
  const missingSections = requiredSections.filter((item) => !sectionNames.includes(item));
  const missingBadges = requiredBadges.filter((item) => !page.uiBadges.includes(item));
  const missingNoSecretRules = requiredNoSecretRules.filter(
    (item) => !page.noSecretReplayRules.includes(item)
  );

  const checks = [
    {
      name: "Correlation replay UI page is ready",
      passed: page.status === "correlation_replay_ui_page_ready",
      detail: page.status,
    },
    {
      name: "Replay route is defined",
      passed: page.route === "/audit/replay",
      detail: page.route,
    },
    {
      name: "Required page sections present",
      passed: missingSections.length === 0,
      detail: missingSections.length ? `Missing: ${missingSections.join(", ")}` : "All sections present.",
    },
    {
      name: "Sample replay exists and is redacted",
      passed:
        page.sampleReplay.redacted === true &&
        page.sampleReplay.events.length >= 3 &&
        page.sampleReplay.events.every((event) => event.redacted === true),
      detail: `${page.sampleReplay.events.length} redacted replay events`,
    },
    {
      name: "Replay panels present",
      passed: page.replayPanels.length >= 6,
      detail: `${page.replayPanels.length} replay panels`,
    },
    {
      name: "Replay rules present",
      passed: page.replayRules.length >= 9,
      detail: `${page.replayRules.length} replay rules`,
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
      name: "No-secret replay rules present",
      passed: missingNoSecretRules.length === 0,
      detail: missingNoSecretRules.length
        ? `Missing: ${missingNoSecretRules.join(", ")}`
        : "Core no-secret replay rules present.",
    },
    {
      name: "Integration source statuses present",
      passed:
        page.integrationSources.auditReviewPageStatus === "audit_review_ui_page_ready" &&
        page.integrationSources.correlationReplayStatus === "correlation_replay_blueprint_ready",
      detail: "Integration sources linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v19.5 Phase 215",
    service: "Correlation Replay UI Page Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    pageSectionCount: page.pageSections.length,
    sampleReplayEventCount: page.sampleReplay.events.length,
    replayPanelCount: page.replayPanels.length,
    replayRuleCount: page.replayRules.length,
    badgeCount: page.uiBadges.length,
    apiLinkCount: page.apiLinks.length,
    noSecretRuleCount: page.noSecretReplayRules.length,
    checks,
  });
}
