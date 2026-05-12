import crypto from "crypto";
import { prisma } from "@/lib/db";

function stableStringify(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

function computeAuditHash({
  previousHash,
  companyId,
  workspaceId,
  projectId,
  actorId,
  actorType,
  action,
  entityType,
  entityId,
  severity,
  metadata,
  beforeJson,
  afterJson,
  createdAt,
}: {
  previousHash?: string | null;
  companyId?: string | null;
  workspaceId?: string | null;
  projectId?: string | null;
  actorId?: string | null;
  actorType: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  severity: string;
  metadata?: any;
  beforeJson?: any;
  afterJson?: any;
  createdAt: Date;
}) {
  const payload = [
    previousHash || "",
    companyId || "",
    workspaceId || "",
    projectId || "",
    actorId || "",
    actorType,
    action,
    entityType,
    entityId || "",
    severity,
    stableStringify(metadata || {}),
    stableStringify(beforeJson || {}),
    stableStringify(afterJson || {}),
    createdAt.toISOString(),
  ].join("|");

  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function recordAuditEvent({
  companyId,
  workspaceId,
  projectId,
  actorId,
  actorType = "system",
  action,
  entityType,
  entityId,
  severity = "info",
  metadata,
  beforeJson,
  afterJson,
}: {
  companyId?: string | null;
  workspaceId?: string | null;
  projectId?: string | null;
  actorId?: string | null;
  actorType?: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  severity?: "info" | "warning" | "critical";
  metadata?: any;
  beforeJson?: any;
  afterJson?: any;
}) {
  const latest = await prisma.auditEvent.findFirst({
    where: companyId ? { companyId } : {},
    orderBy: { createdAt: "desc" },
  });

  const createdAt = new Date();

  const hash = computeAuditHash({
    previousHash: latest?.hash || null,
    companyId: companyId || null,
    workspaceId: workspaceId || null,
    projectId: projectId || null,
    actorId: actorId || null,
    actorType,
    action,
    entityType,
    entityId: entityId || null,
    severity,
    metadata: metadata || {},
    beforeJson: beforeJson || {},
    afterJson: afterJson || {},
    createdAt,
  });

  return prisma.auditEvent.create({
    data: {
      companyId: companyId || null,
      workspaceId: workspaceId || null,
      projectId: projectId || null,
      actorId: actorId || null,
      actorType,
      action,
      entityType,
      entityId: entityId || null,
      severity,
      metadata: metadata || {},
      beforeJson: beforeJson || {},
      afterJson: afterJson || {},
      previousHash: latest?.hash || null,
      hash,
      createdAt,
    },
  });
}

export async function listAuditEvents({
  companyId,
  projectId,
  actorId,
  action,
  entityType,
  severity,
  limit = 100,
}: {
  companyId?: string | null;
  projectId?: string | null;
  actorId?: string | null;
  action?: string | null;
  entityType?: string | null;
  severity?: string | null;
  limit?: number;
}) {
  const events = await prisma.auditEvent.findMany({
    where: {
      ...(companyId ? { companyId } : {}),
      ...(projectId ? { projectId } : {}),
      ...(actorId ? { actorId } : {}),
      ...(action ? { action } : {}),
      ...(entityType ? { entityType } : {}),
      ...(severity ? { severity } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    ok: true,
    events,
    summary: {
      total: events.length,
      info: events.filter((event) => event.severity === "info").length,
      warning: events.filter((event) => event.severity === "warning").length,
      critical: events.filter((event) => event.severity === "critical").length,
      uniqueActors: new Set(events.map((event) => event.actorId || event.actorType)).size,
      uniqueActions: new Set(events.map((event) => event.action)).size,
    },
  };
}

export async function verifyAuditChain(companyId?: string | null) {
  const events = await prisma.auditEvent.findMany({
    where: companyId ? { companyId } : {},
    orderBy: { createdAt: "asc" },
  });

  const issues: any[] = [];
  let previousHash: string | null = null;

  for (const event of events) {
    if ((event.previousHash || null) !== previousHash) {
      issues.push({
        eventId: event.id,
        type: "BROKEN_PREVIOUS_HASH",
        expected: previousHash,
        actual: event.previousHash,
      });
    }

    const recomputed = computeAuditHash({
      previousHash: event.previousHash || null,
      companyId: event.companyId || null,
      workspaceId: event.workspaceId || null,
      projectId: event.projectId || null,
      actorId: event.actorId || null,
      actorType: event.actorType,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId || null,
      severity: event.severity,
      metadata: event.metadata || {},
      beforeJson: event.beforeJson || {},
      afterJson: event.afterJson || {},
      createdAt: event.createdAt,
    });

    if (recomputed !== event.hash) {
      issues.push({
        eventId: event.id,
        type: "HASH_MISMATCH",
        expected: recomputed,
        actual: event.hash,
      });
    }

    previousHash = event.hash;
  }

  return {
    ok: issues.length === 0,
    companyId: companyId || null,
    checkedEvents: events.length,
    issues,
  };
}

export async function createComplianceReport({
  companyId,
  workspaceId,
  generatedBy,
}: {
  companyId: string;
  workspaceId?: string | null;
  generatedBy?: string | null;
}) {
  const [audit, chain] = await Promise.all([
    listAuditEvents({
      companyId,
      limit: 500,
    }),
    verifyAuditChain(companyId),
  ]);

  const findings = [
    ...(chain.ok
      ? [
          {
            severity: "info",
            title: "Audit chain verified",
            detail: `${chain.checkedEvents} audit event(s) verified successfully.`,
          },
        ]
      : [
          {
            severity: "critical",
            title: "Audit chain verification failed",
            detail: `${chain.issues.length} chain issue(s) found.`,
          },
        ]),
    ...(audit.summary.critical > 0
      ? [
          {
            severity: "critical",
            title: "Critical audit events exist",
            detail: `${audit.summary.critical} critical event(s) found.`,
          },
        ]
      : []),
  ];

  const report = await prisma.complianceReport.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      title: "OmegaCrownAI Compliance Report",
      status: chain.ok ? "generated" : "needs_review",
      scope: "company",
      summary: {
        auditSummary: audit.summary,
        chainVerified: chain.ok,
        checkedEvents: chain.checkedEvents,
      },
      findings,
      metadata: {
        source: "phase33_audit_compliance",
      },
      generatedBy: generatedBy || "system",
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    actorId: generatedBy || "system",
    actorType: "system",
    action: "COMPLIANCE_REPORT_GENERATED",
    entityType: "ComplianceReport",
    entityId: report.id,
    severity: chain.ok ? "info" : "critical",
    metadata: {
      reportId: report.id,
      chainVerified: chain.ok,
      checkedEvents: chain.checkedEvents,
    },
  });

  return {
    ok: true,
    report,
    chain,
  };
}

export async function getAuditDashboard(companyId: string) {
  const [events, reports, chain] = await Promise.all([
    listAuditEvents({
      companyId,
      limit: 100,
    }),
    prisma.complianceReport.findMany({
      where: { companyId },
      orderBy: { generatedAt: "desc" },
      take: 25,
    }),
    verifyAuditChain(companyId),
  ]);

  const actionCounts = events.events.reduce((acc: Record<string, number>, event) => {
    acc[event.action] = (acc[event.action] || 0) + 1;
    return acc;
  }, {});

  const actorCounts = events.events.reduce((acc: Record<string, number>, event) => {
    const key = event.actorId || event.actorType || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    ok: true,
    companyId,
    events: events.events,
    reports,
    chain,
    actionCounts,
    actorCounts,
    summary: {
      ...events.summary,
      reports: reports.length,
      chainVerified: chain.ok,
      chainIssues: chain.issues.length,
    },
  };
}
