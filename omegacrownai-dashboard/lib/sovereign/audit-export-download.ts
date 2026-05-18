import {
  createAuditExportPreview,
  getAuditExportApiBlueprint,
} from "@/lib/sovereign/audit-export-api";
import { getCorrelationReplayViewBlueprint } from "@/lib/sovereign/correlation-replay-view";
import { getAuditReviewUiPage } from "@/lib/sovereign/audit-review-ui-page";

type AuditExportDownloadInput = {
  exportType?: string;
  correlationId?: string;
  requestedBy?: string;
  reason?: string;
  format?: string;
};

export function createAuditExportDownloadPackage(input: AuditExportDownloadInput = {}) {
  const auditExport = getAuditExportApiBlueprint();
  const replay = getCorrelationReplayViewBlueprint();
  const auditReview = getAuditReviewUiPage();

  const correlationId =
    input.correlationId || replay.sampleReplay.correlationId || "corr_phase_216_sample";

  const preview = createAuditExportPreview({
    exportType: input.exportType || "correlation_replay_export",
    filters: {
      correlationId,
    },
    includeEvidence: true,
    includeReviewerNotes: true,
    format: input.format || "json",
    requestedBy: input.requestedBy || "admin",
    reason: input.reason || "internal_review",
  });

  const packageFiles = {
    "audit-summary.json": {
      phase: "v19.6 Phase 216",
      exportId: preview.exportId,
      exportType: preview.exportType,
      correlationId,
      requestedBy: preview.requestedBy,
      reason: preview.reason,
      redacted: true,
      generatedAt: new Date().toISOString(),
      source: "OmegaCrownAI Audit Export Download Route",
    },
    "redacted-events.json": replay.sampleReplay.events.map((event) => ({
      sequence: event.sequence,
      auditId: event.auditId,
      eventType: event.eventType,
      source: event.source,
      actor: event.actor,
      role: event.role,
      decision: event.decision,
      status: event.status,
      riskLevel: event.riskLevel,
      evidence: event.evidence,
      metadataRef: event.metadataRef,
      redacted: true,
      createdAt: event.createdAt,
    })),
    "evidence-chain.json": replay.sampleReplay.events.map((event) => ({
      auditId: event.auditId,
      evidence: event.evidence,
      metadataRef: event.metadataRef,
      redacted: true,
    })),
    "correlation-replay.json": {
      correlationId: replay.sampleReplay.correlationId,
      workflowName: replay.sampleReplay.workflowName,
      status: replay.sampleReplay.status,
      riskLevel: replay.sampleReplay.riskLevel,
      redacted: true,
      eventCount: replay.sampleReplay.events.length,
    },
    "reviewer-notes.md": [
      "# OmegaCrownAI Redacted Audit Export",
      "",
      `Export ID: ${preview.exportId}`,
      `Correlation ID: ${correlationId}`,
      `Requested by: ${preview.requestedBy}`,
      `Reason: ${preview.reason}`,
      "",
      "## Review Notes",
      "- This export is redacted.",
      "- Evidence is provided as safe labels and metadata references.",
      "- Raw secrets and sensitive payloads are excluded.",
      "- Use correlation replay for workflow traceability.",
    ].join("\n"),
    "secret-exclusions.json": {
      redacted: true,
      excludedSensitiveData: auditExport.secretExclusionRules,
      displayRules: auditReview.noSecretDisplayRules,
    },
  };

  return {
    ok: preview.ok,
    phase: "v19.6 Phase 216",
    service: "Audit Export Download Route",
    exportId: preview.exportId,
    contentType: "application/json",
    filename: `${preview.exportId}.json`,
    redacted: true,
    manifest: Object.keys(packageFiles),
    packageFiles,
    validation: preview.validation,
    downloadHeaders: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${preview.exportId}.json"`,
      "Cache-Control": "no-store",
      "X-OmegaCrownAI-Artifact": "redacted_audit_export_package",
    },
  };
}

export function getAuditExportDownloadRouteBlueprint() {
  const samplePackage = createAuditExportDownloadPackage({
    exportType: "correlation_replay_export",
    correlationId: "corr_phase_208_sample",
    requestedBy: "admin",
    reason: "internal_review",
    format: "json",
  });

  return {
    system: "OmegaCrownAI Audit Export Download Route",
    phase: "v19.6 Phase 216",
    status: "audit_export_download_route_ready",
    purpose:
      "Provide a redacted downloadable audit export package with summary, redacted events, evidence chain, correlation replay, reviewer notes, and secret exclusions.",
    corePrinciple:
      "Audit exports must be downloadable, redacted, manifest-based, correlation-aware, reviewer-ready, and must never include raw secrets.",
    route: "/api/sovereign/audit-export-download",
    supportedFormats: ["json"],
    packageManifest: samplePackage.manifest,
    requiredFiles: [
      "audit-summary.json",
      "redacted-events.json",
      "evidence-chain.json",
      "correlation-replay.json",
      "reviewer-notes.md",
      "secret-exclusions.json",
    ],
    downloadRules: [
      "Export must be redacted.",
      "Export must include a manifest.",
      "Export must include secret exclusions.",
      "Export must include reviewer notes.",
      "Export must include correlation replay summary.",
      "Export must return attachment content-disposition.",
      "Export must use no-store cache policy.",
      "Export must not include raw secrets or sensitive payloads.",
    ],
    samplePackage,
    nextImplementationPhases: [
      "Execution Runner Audit Write Integration",
      "Connector Audit Write Integration",
      "Enterprise Audit Dashboard",
      "Incident Timeline Review Page",
      "Audit Export ZIP Package",
    ],
  };
}
