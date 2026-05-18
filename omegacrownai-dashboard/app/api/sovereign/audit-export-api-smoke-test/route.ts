import { NextResponse } from "next/server";
import {
  createAuditExportPreview,
  getAuditExportApiBlueprint,
} from "@/lib/sovereign/audit-export-api";

export async function GET() {
  const auditExport = getAuditExportApiBlueprint();

  const validExport = createAuditExportPreview({
    exportType: "correlation_replay_export",
    filters: {
      correlationId: "corr_phase_208_sample",
    },
    includeEvidence: true,
    includeReviewerNotes: true,
    format: "json",
    requestedBy: "admin",
    reason: "internal_review",
  });

  const invalidExport = createAuditExportPreview({
    exportType: "correlation_replay_export",
    filters: {},
    format: "raw_secret_dump",
    requestedBy: "admin",
  });

  const checks = [
    {
      name: "Audit export API blueprint is ready",
      passed: auditExport.status === "audit_export_api_blueprint_ready",
      detail: auditExport.status,
    },
    {
      name: "Export types present",
      passed: auditExport.exportTypes.length >= 6,
      detail: `${auditExport.exportTypes.length} export types`,
    },
    {
      name: "Allowed filters present",
      passed: auditExport.allowedFilters.length >= 11,
      detail: `${auditExport.allowedFilters.length} filters`,
    },
    {
      name: "Export package manifest present",
      passed: auditExport.exportPackageShape.manifest.length >= 6,
      detail: `${auditExport.exportPackageShape.manifest.length} manifest files`,
    },
    {
      name: "Secret exclusion rules present",
      passed: auditExport.secretExclusionRules.length >= 8,
      detail: `${auditExport.secretExclusionRules.length} secret exclusions`,
    },
    {
      name: "Validation rules present",
      passed: auditExport.validationRules.length >= 8,
      detail: `${auditExport.validationRules.length} validation rules`,
    },
    {
      name: "Valid export passes",
      passed: validExport.ok === true,
      detail: validExport.ok ? "valid export accepted" : validExport.validation.errors.join(", "),
    },
    {
      name: "Invalid export is rejected",
      passed: invalidExport.ok === false,
      detail: invalidExport.validation.errors.join(", "),
    },
    {
      name: "Export is redacted",
      passed: validExport.redacted === true,
      detail: "redacted export confirmed",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v18.9 Phase 209",
    service: "Audit Export API Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    exportTypeCount: auditExport.exportTypes.length,
    allowedFilterCount: auditExport.allowedFilters.length,
    manifestFileCount: auditExport.exportPackageShape.manifest.length,
    secretExclusionCount: auditExport.secretExclusionRules.length,
    validationRuleCount: auditExport.validationRules.length,
    validExportOk: validExport.ok,
    invalidExportRejected: !invalidExport.ok,
    redacted: validExport.redacted,
    checks,
  });
}
