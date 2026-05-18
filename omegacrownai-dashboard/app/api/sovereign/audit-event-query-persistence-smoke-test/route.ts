import { NextResponse } from "next/server";
import {
  createAuditEventQueryPersistencePreview,
  getAuditEventQueryPersistenceBlueprint,
} from "@/lib/sovereign/audit-event-query-persistence";

export async function GET() {
  const persistence = getAuditEventQueryPersistenceBlueprint();

  const validQuery = createAuditEventQueryPersistencePreview({
    eventType: "execution_action_run",
    source: "execution_runner",
    status: "succeeded",
    correlationId: "corr_phase_212_sample",
    page: 1,
    pageSize: 25,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const correlationQuery = createAuditEventQueryPersistencePreview({
    correlationId: "corr_phase_212_sample",
    page: 1,
    pageSize: 25,
    sortBy: "createdAt",
    sortDirection: "asc",
  });

  const invalidQuery = createAuditEventQueryPersistencePreview({
    eventType: "unknown_event",
    page: 1,
    pageSize: 500,
    sortBy: "password",
    sortDirection: "sideways",
  });

  const checks = [
    {
      name: "Audit query persistence blueprint is ready",
      passed: persistence.status === "audit_query_persistence_blueprint_ready",
      detail: persistence.status,
    },
    {
      name: "Query persistence flow present",
      passed: persistence.queryPersistenceFlow.length >= 9,
      detail: `${persistence.queryPersistenceFlow.length} flow steps`,
    },
    {
      name: "Prisma query plan present",
      passed:
        persistence.prismaQueryPlan.model === "auditEvent" &&
        persistence.prismaQueryPlan.findManyMethod === "prisma.auditEvent.findMany" &&
        persistence.prismaQueryPlan.countMethod === "prisma.auditEvent.count",
      detail: "Prisma query plan defined.",
    },
    {
      name: "Supported filters present",
      passed: persistence.supportedFilters.length >= 10,
      detail: `${persistence.supportedFilters.length} filters`,
    },
    {
      name: "Correlation lookup rules present",
      passed: persistence.correlationLookupRules.length >= 5,
      detail: `${persistence.correlationLookupRules.length} correlation rules`,
    },
    {
      name: "No-secret response policy present",
      passed: persistence.noSecretResponsePolicy.length >= 8,
      detail: `${persistence.noSecretResponsePolicy.length} no-secret response rules`,
    },
    {
      name: "Pagination rules present",
      passed: persistence.paginationRules.length >= 5,
      detail: `${persistence.paginationRules.length} pagination rules`,
    },
    {
      name: "Valid query would run",
      passed:
        validQuery.ok === true &&
        validQuery.wouldQuery === true &&
        validQuery.prismaQueryPlan.method === "findMany",
      detail: validQuery.ok ? "valid query accepted" : validQuery.validation.errors.join(", "),
    },
    {
      name: "Correlation query would run",
      passed:
        correlationQuery.ok === true &&
        correlationQuery.wouldQuery === true &&
        Boolean(correlationQuery.prismaQueryPlan.where.correlationId),
      detail: "correlation query accepted",
    },
    {
      name: "Invalid query rejected",
      passed: invalidQuery.ok === false && invalidQuery.wouldQuery === false,
      detail: invalidQuery.validation.errors.join(", "),
    },
    {
      name: "Results are redacted",
      passed: validQuery.redactedResultMapping.every((item) => item.redacted === true),
      detail: `${validQuery.redactedResultMapping.length} redacted sample results`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v19.3 Phase 213",
    service: "Audit Event Query Persistence Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    queryFlowStepCount: persistence.queryPersistenceFlow.length,
    supportedFilterCount: persistence.supportedFilters.length,
    correlationRuleCount: persistence.correlationLookupRules.length,
    noSecretResponseRuleCount: persistence.noSecretResponsePolicy.length,
    paginationRuleCount: persistence.paginationRules.length,
    validQueryWouldRun: validQuery.wouldQuery,
    correlationQueryWouldRun: correlationQuery.wouldQuery,
    invalidQueryRejected: !invalidQuery.ok,
    redactedResultCount: validQuery.redactedResultMapping.filter((item) => item.redacted).length,
    checks,
  });
}
