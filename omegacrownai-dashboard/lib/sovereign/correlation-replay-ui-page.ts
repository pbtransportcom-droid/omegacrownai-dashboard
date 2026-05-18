import { getAuditReviewUiPage } from "@/lib/sovereign/audit-review-ui-page";
import { getCorrelationReplayViewBlueprint } from "@/lib/sovereign/correlation-replay-view";

export function getCorrelationReplayUiPage() {
  const replay = getCorrelationReplayViewBlueprint();
  const auditPage = getAuditReviewUiPage();

  return {
    system: "OmegaCrownAI Correlation Replay UI Page",
    phase: "v19.5 Phase 215",
    status: "correlation_replay_ui_page_ready",
    purpose:
      "Expose a customer/admin replay page for tracing audit workflows by correlation id with redacted event timeline, evidence chain, approval/blocked markers, rollback context, and export actions.",
    corePrinciple:
      "Every important workflow should be replayable from a correlation id without exposing secrets, raw payloads, tokens, or unsafe metadata.",

    route: "/audit/replay",

    pageSections: [
      {
        section: "Replay Header",
        purpose:
          "Shows correlation id, workflow name, status, risk, event count, redaction state, and quick links.",
      },
      {
        section: "Workflow Summary",
        purpose:
          "Explains what happened, current state, whether review is needed, and whether recovery exists.",
      },
      {
        section: "Event Sequence Timeline",
        purpose:
          "Shows ordered replay events with sequence number, event type, source, actor, decision, status, risk, and timestamp.",
      },
      {
        section: "Evidence Chain",
        purpose:
          "Shows safe evidence labels, metadata references, hashes, route checks, smoke tests, and audit links.",
      },
      {
        section: "Approval / Blocked Markers",
        purpose:
          "Highlights approval-required, blocked, denied, and blocked-by-default events.",
      },
      {
        section: "Recovery / Rollback Panel",
        purpose:
          "Shows rollback availability, recovery note, safe retry path, and owner review requirement.",
      },
      {
        section: "Redacted Export Panel",
        purpose:
          "Links replay package to redacted audit export workflow.",
      },
    ],

    sampleReplay: replay.sampleReplay,

    replayPanels: replay.replayPanels,

    replayRules: replay.replayRules,

    exportPackageShape: replay.exportPackageShape,

    apiLinks: [
      "/api/sovereign/correlation-replay-view",
      "/api/sovereign/correlation-replay-view-smoke-test",
      "/api/sovereign/audit-event-query-persistence",
      "/api/sovereign/audit-export-api",
      "/api/sovereign/audit-review-ui-page",
    ],

    integrationSources: {
      auditReviewPageStatus: auditPage.status,
      correlationReplayStatus: replay.status,
    },

    uiBadges: [
      "correlation id",
      "redacted replay",
      "safe evidence",
      "approval required",
      "blocked marker",
      "rollback context",
      "export ready",
    ],

    noSecretReplayRules: [
      "Never display raw OAuth tokens.",
      "Never display API keys.",
      "Never display passwords.",
      "Never display bearer authorization headers.",
      "Never display private keys.",
      "Never display webhook secrets.",
      "Display metadataRef instead of raw payloads.",
      "Display evidence labels, hashes, and safe references only.",
    ],

    nextImplementationPhases: [
      "Audit Export Download Route",
      "Execution Runner Audit Write Integration",
      "Connector Audit Write Integration",
      "Enterprise Audit Dashboard",
      "Incident Timeline Review Page",
    ],
  };
}
