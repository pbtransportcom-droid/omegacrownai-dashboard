import { NextResponse } from "next/server";
import {
  createAuditEventQueryPreview,
  getAuditEventQueryApiBlueprint,
} from "@/lib/sovereign/audit-event-query-api";

export async function GET() {
  const auditQuery = getAuditEventQueryApiBlueprint();

  const validQuery = createAuditEventQueryPreview({
    eventType: "execution_action_run",
    source: "execution_runner",
    status: "succeeded",
    correlationId: "corr_phase_205_sample",
    page: 1,
    pageSize: 25,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const invalidQuery = createAuditEventQueryPreview({
    eventType: "unknown_event",
    page: 1,
    pageSize: 500,
    sortBy: "password",
    sortDirection: "sideways",
  });

  const checks = [
    {
      name: "Audit query API blueprint is ready",
      passed: auditQuery.status === "audit_query_api_blueprint_ready",
      detail: auditQuery.status,
    },
    {
      name: "Allowed event types present",
      passed: auditQuery.allowedEventTypes.length >= 8,
      detail: `${auditQuery.allowedEventTypes.length} event types`,
    },
    {
      name: "Allowed query filters present",
      passed: auditQuery.allowedQueryFilters.length >= 10,
      detail: `${auditQuery.allowedQueryFilters.length} filters`,
    },
    {
      name: "Pagination shape present",
      passed: Boolean(
        auditQuery.paginationShape.page &&
          auditQuery.paginationShape.pageSize &&
          auditQuery.paginationShape.hasNextPage
      ),
      detail: "Pagination shape defined.",
    },
    {
      name: "Redacted response shape present",
      passed: Boolean(
        auditQuery.redactedAuditEventShape.auditId &&
          auditQuery.redactedAuditEventShape.metadataRef &&
          auditQuery.redactedAuditEventShape.redacted
      ),
      detail: "Redacted audit event shape defined.",
    },
    {
      name: "Query validation rules present",
      passed: auditQuery.queryValidationRules.length >= 8,
      detail: `${auditQuery.queryValidationRules.length} query rules`,
    },
    {
      name: "Valid query passes",
      passed: validQuery.ok === true,
      detail: validQuery.ok ? "valid query accepted" : validQuery.validation.errors.join(", "),
    },
    {
      name: "Invalid query is rejected",
      passed: invalidQuery.ok === false,
      detail: invalidQuery.validation.errors.join(", "),
    },
    {
      name: "Results are redacted",
      passed: validQuery.results.every((item) => item.redacted === true),
      detail: "All sample results redacted.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v18.6 Phase 206",
    service: "Audit Event Query API Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    eventTypeCount: auditQuery.allowedEventTypes.length,
    queryFilterCount: auditQuery.allowedQueryFilters.length,
    sortFieldCount: auditQuery.allowedSortFields.length,
    validationRuleCount: auditQuery.queryValidationRules.length,
    validQueryOk: validQuery.ok,
    invalidQueryRejected: !invalidQuery.ok,
    redactedResultCount: validQuery.results.filter((item) => item.redacted).length,
    checks,
  });
}
