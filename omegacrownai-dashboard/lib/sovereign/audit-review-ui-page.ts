import { getAuditEventReviewUiBlueprint } from "@/lib/sovereign/audit-event-review-ui";
import { getAuditEventQueryPersistenceBlueprint } from "@/lib/sovereign/audit-event-query-persistence";
import { getCorrelationReplayViewBlueprint } from "@/lib/sovereign/correlation-replay-view";

export function getAuditReviewUiPage() {
  const reviewUi = getAuditEventReviewUiBlueprint();
  const queryPersistence = getAuditEventQueryPersistenceBlueprint();
  const replay = getCorrelationReplayViewBlueprint();

  return {
    system: "OmegaCrownAI Audit Review UI Page",
    phase: "v19.4 Phase 214",
    status: "audit_review_ui_page_ready",
    purpose:
      "Expose a customer/admin audit review page for redacted audit timeline cards, filters, evidence review, blocked/approval markers, correlation replay links, and export actions.",
    corePrinciple:
      "Audit review must be visible, searchable, redacted, evidence-backed, and safe for enterprise use without exposing raw secrets.",

    route: "/audit",

    pageSections: [
      {
        section: "Audit Overview Header",
        purpose:
          "Shows audit readiness, redaction policy, event counts, and quick access to query/write/replay/export APIs.",
      },
      {
        section: "Audit Filter Panel",
        purpose:
          "Provides event type, actor, role, source, risk, decision, status, correlation id, and date filters.",
      },
      {
        section: "Audit Timeline Cards",
        purpose:
          "Shows redacted audit cards with event type, title, actor, role, source, risk, decision, status, evidence count, and timestamp.",
      },
      {
        section: "Evidence Review Panel",
        purpose:
          "Shows safe evidence labels, metadata references, redaction status, and no-secret warning.",
      },
      {
        section: "Correlation Replay Actions",
        purpose:
          "Links audit cards to correlation replay flow for workflow traceability.",
      },
      {
        section: "Approval / Blocked Markers",
        purpose:
          "Highlights require_approval, blocked, blocked_by_default, and needs_review records.",
      },
      {
        section: "Export / Review Actions",
        purpose:
          "Links to redacted export package API and reviewer-note workflow.",
      },
    ],

    filters: reviewUi.filters,

    sampleCards: reviewUi.sampleTimelineCards,

    uiBadges: [
      "redacted",
      "safe evidence only",
      "approval required",
      "blocked",
      "blocked by default",
      "correlation replay",
      "export ready",
    ],

    apiLinks: [
      "/api/sovereign/audit-event-query-persistence",
      "/api/sovereign/audit-event-query-persistence-smoke-test",
      "/api/sovereign/audit-event-write-persistence",
      "/api/sovereign/correlation-replay-view",
      "/api/sovereign/audit-export-api",
    ],

    integrationSources: {
      reviewUiStatus: reviewUi.status,
      queryPersistenceStatus: queryPersistence.status,
      replayStatus: replay.status,
    },

    noSecretDisplayRules: [
      "Never display raw OAuth tokens.",
      "Never display API keys.",
      "Never display passwords.",
      "Never display bearer authorization headers.",
      "Never display private keys.",
      "Never display webhook secrets.",
      "Show metadataRef instead of raw payloads.",
      "Show evidence labels and hashes only.",
    ],

    nextImplementationPhases: [
      "Correlation Replay UI Page",
      "Audit Export Download Route",
      "Execution Runner Audit Write Integration",
      "Connector Audit Write Integration",
      "Enterprise Audit Dashboard",
    ],
  };
}
