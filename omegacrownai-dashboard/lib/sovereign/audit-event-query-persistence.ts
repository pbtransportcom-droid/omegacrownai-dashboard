import {
  createAuditEventQueryPreview,
  validateAuditEventQuery,
} from "@/lib/sovereign/audit-event-query-api";

type AuditQueryPersistenceInput = {
  eventType?: string;
  actor?: string;
  role?: string;
  source?: string;
  riskLevel?: string;
  decision?: string;
  status?: string;
  correlationId?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
};

const allowedWhereFields = [
  "eventType",
  "actor",
  "role",
  "source",
  "riskLevel",
  "decision",
  "status",
  "correlationId",
  "createdAt",
];

function buildWherePreview(input: AuditQueryPersistenceInput) {
  const where: Record<string, unknown> = {};

  if (input.eventType) where.eventType = input.eventType;
  if (input.actor) where.actor = input.actor;
  if (input.role) where.role = input.role;
  if (input.source) where.source = input.source;
  if (input.riskLevel) where.riskLevel = input.riskLevel;
  if (input.decision) where.decision = input.decision;
  if (input.status) where.status = input.status;
  if (input.correlationId) where.correlationId = input.correlationId;

  if (input.createdFrom || input.createdTo) {
    where.createdAt = {
      ...(input.createdFrom ? { gte: input.createdFrom } : {}),
      ...(input.createdTo ? { lte: input.createdTo } : {}),
    };
  }

  return where;
}

export function createAuditEventQueryPersistencePreview(input: AuditQueryPersistenceInput) {
  const queryPreview = createAuditEventQueryPreview(input);
  const validation = validateAuditEventQuery(input);
  const page = validation.normalized.page;
  const pageSize = validation.normalized.pageSize;
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  const where = buildWherePreview(input);

  return {
    ok: validation.ok,
    mode: "query_persistence_blueprint_preview",
    wouldQuery: validation.ok,
    prismaQueryPlan: {
      model: "auditEvent",
      method: "findMany",
      where,
      orderBy: {
        [validation.normalized.sortBy]: validation.normalized.sortDirection,
      },
      skip,
      take,
      select: {
        id: true,
        eventType: true,
        actor: true,
        role: true,
        source: true,
        riskLevel: true,
        decision: true,
        status: true,
        correlationId: true,
        evidenceJson: true,
        metadataRef: true,
        redacted: true,
        createdAt: true,
      },
    },
    countQueryPlan: {
      model: "auditEvent",
      method: "count",
      where,
    },
    redactedResultMapping: queryPreview.results.map((item) => ({
      auditId: item.auditId,
      eventType: item.eventType,
      actor: item.actor,
      role: item.role,
      source: item.source,
      riskLevel: item.riskLevel,
      decision: item.decision,
      status: item.status,
      correlationId: item.correlationId,
      evidence: item.evidence,
      metadataRef: item.metadataRef,
      redacted: true,
      createdAt: item.createdAt,
    })),
    validation,
    responseShape: {
      ok: validation.ok,
      redacted: true,
      page,
      pageSize,
      totalItems: "database_count_result",
      totalPages: "Math.ceil(totalItems / pageSize)",
      results: "redacted audit event list",
    },
  };
}

export function getAuditEventQueryPersistenceBlueprint() {
  const sampleQuery = createAuditEventQueryPersistencePreview({
    eventType: "execution_action_run",
    source: "execution_runner",
    status: "succeeded",
    correlationId: "corr_phase_212_sample",
    page: 1,
    pageSize: 25,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const invalidQuery = createAuditEventQueryPersistencePreview({
    eventType: "unknown_event",
    page: 1,
    pageSize: 500,
    sortBy: "password",
    sortDirection: "sideways",
  });

  return {
    system: "OmegaCrownAI Audit Event Query Persistence",
    phase: "v19.3 Phase 213",
    status: "audit_query_persistence_blueprint_ready",
    purpose:
      "Define how Audit Event Query API becomes database-backed while preserving safe filters, pagination, redacted result mapping, correlation replay lookup, and no-secret response policy.",
    corePrinciple:
      "Audit query persistence must return only redacted, scoped, paginated, access-controlled audit records and must never expose raw secrets or sensitive payloads.",

    queryPersistenceFlow: [
      "Receive audit query request.",
      "Validate eventType, sortBy, sortDirection, and pagination.",
      "Normalize page and cap pageSize at 100.",
      "Build Prisma where clause from allowed filters only.",
      "Run database count query for pagination.",
      "Run database findMany query with redacted select fields.",
      "Map database rows into redacted audit event response shape.",
      "Return pagination metadata and redacted results.",
      "Preserve correlationId for replay workflows.",
    ],

    prismaQueryPlan: {
      model: "auditEvent",
      findManyMethod: "prisma.auditEvent.findMany",
      countMethod: "prisma.auditEvent.count",
      allowedWhereFields,
      requiredSelectPolicy:
        "Select safe audit columns only: id, eventType, actor, role, source, riskLevel, decision, status, correlationId, evidenceJson, metadataRef, redacted, createdAt.",
      maxPageSize: 100,
      defaultPageSize: 25,
      defaultSort: "createdAt desc",
    },

    supportedFilters: [
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

    correlationLookupRules: [
      "correlationId should use exact match.",
      "Correlation replay queries should order by createdAt ascending for timeline view.",
      "General audit queries should default to createdAt descending.",
      "Correlation replay results must remain redacted.",
      "Correlation lookup must support execution, connector, deployment, incident, memory, and governance events.",
    ],

    noSecretResponsePolicy: [
      "Never select raw metadata payloads.",
      "Never return OAuth tokens.",
      "Never return API keys.",
      "Never return passwords.",
      "Never return bearer authorization headers.",
      "Never return private keys.",
      "Never return webhook secrets.",
      "Return metadataRef, evidence labels, hashes, and redacted fields only.",
    ],

    paginationRules: [
      "Default page is 1.",
      "Default pageSize is 25.",
      "Maximum pageSize is 100.",
      "Return totalItems, totalPages, and hasNextPage.",
      "Broad queries must be paginated.",
    ],

    sampleQuery,
    invalidQuery,

    nextImplementationPhases: [
      "Audit Review UI Page",
      "Correlation Replay UI Page",
      "Audit Export Download Route",
      "Execution Runner Audit Write Integration",
      "Connector Audit Write Integration",
    ],
  };
}
