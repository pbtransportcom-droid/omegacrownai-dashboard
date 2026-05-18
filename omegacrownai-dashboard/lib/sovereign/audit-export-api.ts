export function getAuditExportApiBlueprint() {
  return {
    system: "OmegaCrownAI Audit Export API Blueprint",
    phase: "v18.9 Phase 209",
    status: "audit_export_api_blueprint_ready",
    purpose:
      "Define safe redacted audit export packages for enterprise review, support, compliance, incident review, deployment review, connector review, and correlation replay.",
    corePrinciple:
      "Audit exports must be redacted, filter-scoped, correlation-aware, evidence-backed, reviewable, and must never include raw secrets or sensitive payloads.",

    exportTypes: [
      {
        type: "correlation_replay_export",
        purpose: "Export one workflow trace by correlationId.",
        requiredFilters: ["correlationId"],
      },
      {
        type: "incident_export",
        purpose: "Export incident timeline, severity, evidence, root cause, recovery, and prevention notes.",
        requiredFilters: ["eventType", "createdFrom", "createdTo"],
      },
      {
        type: "deployment_export",
        purpose: "Export build, PM2, route smoke check, commit, rollback, and production verification events.",
        requiredFilters: ["eventType", "createdFrom", "createdTo"],
      },
      {
        type: "connector_export",
        purpose: "Export connector install, permission gate, action decision, healthcheck, disconnect, and audit records.",
        requiredFilters: ["source", "createdFrom", "createdTo"],
      },
      {
        type: "governance_export",
        purpose: "Export approval, blocked action, policy decision, and role/permission audit records.",
        requiredFilters: ["eventType", "riskLevel", "createdFrom", "createdTo"],
      },
      {
        type: "custom_filtered_export",
        purpose: "Export a filtered audit review package using allowed query filters.",
        requiredFilters: ["at least one allowed filter"],
      },
    ],

    allowedFilters: [
      "exportType",
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
    ],

    exportRequestShape: {
      exportType: "correlation_replay_export | incident_export | deployment_export | connector_export | governance_export | custom_filtered_export",
      filters: "allowed audit query filters",
      includeEvidence: "boolean",
      includeReviewerNotes: "boolean",
      format: "json | zip_manifest",
      requestedBy: "actor/user/admin requesting export",
      reason: "support | compliance | incident_review | customer_review | internal_review",
    },

    exportPackageShape: {
      exportId: "stable export id",
      exportType: "export type",
      generatedAt: "ISO timestamp",
      requestedBy: "actor label",
      redacted: true,
      filtersSummary: "safe summary of filters used",
      manifest: [
        "audit-summary.json",
        "redacted-events.json",
        "evidence-chain.json",
        "correlation-replay.json",
        "reviewer-notes.md",
        "secret-exclusions.json",
      ],
      counts: {
        events: "number",
        evidenceItems: "number",
        correlations: "number",
        blockedEvents: "number",
        approvalRequiredEvents: "number",
      },
    },

    secretExclusionRules: [
      "Do not export raw OAuth tokens.",
      "Do not export API keys.",
      "Do not export passwords.",
      "Do not export bearer authorization headers.",
      "Do not export private keys.",
      "Do not export webhook secrets.",
      "Do not export raw sensitive payloads.",
      "Export hashes, metadata references, and safe evidence labels only.",
    ],

    reviewerNotesShape: {
      reviewer: "reviewer name or role",
      reviewPurpose: "support | compliance | incident_review | customer_review | internal_review",
      summary: "safe review summary",
      findings: "list of findings",
      nextActions: "recommended actions",
      redactionConfirmed: true,
    },

    sampleExportRequest: {
      exportType: "correlation_replay_export",
      filters: {
        correlationId: "corr_phase_208_sample",
      },
      includeEvidence: true,
      includeReviewerNotes: true,
      format: "json",
      requestedBy: "admin",
      reason: "internal_review",
    },

    sampleExportPackage: {
      exportId: "audit_export_corr_phase_208_sample",
      exportType: "correlation_replay_export",
      generatedAt: "2026-05-18T00:00:00.000Z",
      requestedBy: "admin",
      redacted: true,
      filtersSummary: "correlationId=corr_phase_208_sample",
      manifest: [
        "audit-summary.json",
        "redacted-events.json",
        "evidence-chain.json",
        "correlation-replay.json",
        "reviewer-notes.md",
        "secret-exclusions.json",
      ],
      counts: {
        events: 3,
        evidenceItems: 7,
        correlations: 1,
        blockedEvents: 0,
        approvalRequiredEvents: 1,
      },
    },

    validationRules: [
      "exportType must be allowed.",
      "At least one allowed filter is required.",
      "correlation_replay_export requires correlationId.",
      "Exports must be redacted.",
      "Exports must include secret exclusion manifest.",
      "Exports must include filters summary.",
      "Exports must not include raw sensitive payloads.",
      "Exports should include reviewer notes when used for support, compliance, or incident review.",
    ],

    nextImplementationPhases: [
      "Audit Export API Persistence",
      "Audit Export Download Route",
      "Audit Export UI Button",
      "Correlation Replay Export Package",
      "Incident Export Package",
    ],
  };
}

export function createAuditExportPreview(input: {
  exportType?: string;
  filters?: Record<string, string>;
  includeEvidence?: boolean;
  includeReviewerNotes?: boolean;
  format?: string;
  requestedBy?: string;
  reason?: string;
}) {
  const blueprint = getAuditExportApiBlueprint();
  const errors: string[] = [];
  const warnings: string[] = [];

  const exportTypes = blueprint.exportTypes.map((item) => item.type);
  const exportType = input.exportType || "custom_filtered_export";
  const filters = input.filters || {};

  if (!exportTypes.includes(exportType)) {
    errors.push(`Unsupported exportType: ${exportType}`);
  }

  if (Object.keys(filters).length === 0) {
    errors.push("At least one allowed filter is required.");
  }

  if (exportType === "correlation_replay_export" && !filters.correlationId) {
    errors.push("correlation_replay_export requires correlationId.");
  }

  const unknownFilters = Object.keys(filters).filter(
    (filter) => !blueprint.allowedFilters.includes(filter)
  );

  if (unknownFilters.length) {
    errors.push(`Unknown filters: ${unknownFilters.join(", ")}`);
  }

  if (input.format && !["json", "zip_manifest"].includes(input.format)) {
    errors.push("format must be json or zip_manifest.");
  }

  if (!input.includeReviewerNotes) {
    warnings.push("Reviewer notes are recommended for enterprise exports.");
  }

  return {
    ok: errors.length === 0,
    exportId: `audit_export_${exportType}_${filters.correlationId || "filtered"}`.replace(/[^a-zA-Z0-9_]/g, "_"),
    redacted: true,
    appendOnlyRead: true,
    exportType,
    filters,
    includeEvidence: input.includeEvidence !== false,
    includeReviewerNotes: input.includeReviewerNotes === true,
    format: input.format || "json",
    requestedBy: input.requestedBy || "admin",
    reason: input.reason || "internal_review",
    manifest: blueprint.exportPackageShape.manifest,
    secretExclusions: blueprint.secretExclusionRules,
    validation: {
      ok: errors.length === 0,
      errors,
      warnings,
    },
  };
}
