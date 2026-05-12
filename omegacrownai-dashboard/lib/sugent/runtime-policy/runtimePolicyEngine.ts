import { prisma } from "@/lib/db";
import { recordAuditEvent, verifyAuditChain } from "@/lib/sugent/audit/auditEngine";
import { authorizeGovernanceAction } from "@/lib/sugent/governance/governanceEngine";
import { verifyPassport } from "@/lib/sugent/passport/passportEngine";

const DEFAULT_RUNTIME_POLICY_RULES = [
  {
    name: "Render requires governance, QA, identity, and audit",
    resource: "runtime",
    action: "render",
    priority: 10,
    severity: "block",
    requireGovernance: true,
    requireQA: true,
    requirePassport: false,
    requireIdentity: true,
    requireAudit: true,
    requireDeployment: false,
    minQaScore: 70,
  },
  {
    name: "Publish requires full sovereign chain",
    resource: "runtime",
    action: "publish",
    priority: 5,
    severity: "block",
    requireGovernance: true,
    requireQA: true,
    requirePassport: true,
    requireIdentity: true,
    requireAudit: true,
    requireDeployment: true,
    minQaScore: 80,
  },
  {
    name: "Deployment requires passport, governance, audit, and signed release",
    resource: "deployment",
    action: "deploy",
    priority: 5,
    severity: "block",
    requireGovernance: true,
    requireQA: false,
    requirePassport: true,
    requireIdentity: true,
    requireAudit: true,
    requireDeployment: true,
    minQaScore: null,
  },
  {
    name: "Rollback requires governance and audit",
    resource: "deployment",
    action: "rollback",
    priority: 20,
    severity: "block",
    requireGovernance: true,
    requireQA: false,
    requirePassport: false,
    requireIdentity: false,
    requireAudit: true,
    requireDeployment: true,
    minQaScore: null,
  },
  {
    name: "Passport issue requires governance and audit",
    resource: "passport",
    action: "issue",
    priority: 20,
    severity: "block",
    requireGovernance: true,
    requireQA: false,
    requirePassport: false,
    requireIdentity: true,
    requireAudit: true,
    requireDeployment: false,
    minQaScore: null,
  },
];

function safeNumber(value: any, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

async function getLatestQA(companyId: string, projectId?: string | null) {
  const latestVersion = projectId
    ? await prisma.projectVersion.findFirst({
        where: {
          companyId,
          projectId,
        },
        orderBy: { createdAt: "desc" },
      })
    : null;

  if (!latestVersion) return null;

  return prisma.qAScorecard.findFirst({
    where: {
      companyId,
      versionId: latestVersion.id,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getIdentityStatus(companyId: string, projectId?: string | null) {
  const [watermarks, fingerprints] = await Promise.all([
    prisma.platformWatermark.count({
      where: {
        companyId,
        ...(projectId ? { projectId } : {}),
        status: "active",
      },
    }),
    prisma.assetFingerprint.count({
      where: {
        companyId,
        ...(projectId ? { projectId } : {}),
      },
    }),
  ]);

  return {
    ok: watermarks > 0 && fingerprints > 0,
    watermarks,
    fingerprints,
  };
}

async function getPassportStatus(companyId: string, projectId?: string | null) {
  const projectPassport = projectId
    ? await prisma.projectPassport.findFirst({
        where: {
          companyId,
          projectId,
          status: "active",
        },
        orderBy: { issuedAt: "desc" },
      })
    : null;

  const companyPassport = await prisma.platformPassport.findFirst({
    where: {
      companyId,
      status: "active",
    },
    orderBy: { issuedAt: "desc" },
  });

  const passport = projectPassport || companyPassport;

  if (!passport) {
    return {
      ok: false,
      passport: null,
      verification: null,
    };
  }

  const verification = await verifyPassport({
    companyId,
    passportHash: passport.passportHash,
    signatureHash: passport.signatureHash || null,
  });

  return {
    ok: verification.ok,
    passport,
    verification,
  };
}

async function getDeploymentStatus(companyId: string) {
  const release = await prisma.releaseBundle.findFirst({
    where: {
      companyId,
      status: {
        in: ["approved", "deployed"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const deployment = await prisma.deploymentRun.findFirst({
    where: {
      companyId,
      status: "completed",
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    ok: Boolean(release || deployment),
    release,
    deployment,
  };
}

export async function ensureRuntimePolicyRules({
  companyId,
  workspaceId,
}: {
  companyId: string;
  workspaceId?: string | null;
}) {
  const existing = await prisma.runtimePolicyRule.findMany({
    where: {
      companyId,
      workspaceId: workspaceId || null,
    },
    orderBy: { priority: "asc" },
  });

  if (existing.length) {
    return existing;
  }

  await prisma.runtimePolicyRule.createMany({
    data: DEFAULT_RUNTIME_POLICY_RULES.map((rule) => ({
      companyId,
      workspaceId: workspaceId || null,
      name: rule.name,
      resource: rule.resource,
      action: rule.action,
      status: "active",
      severity: rule.severity,
      priority: rule.priority,
      requireGovernance: rule.requireGovernance,
      requireQA: rule.requireQA,
      requirePassport: rule.requirePassport,
      requireIdentity: rule.requireIdentity,
      requireAudit: rule.requireAudit,
      requireDeployment: rule.requireDeployment,
      minQaScore: rule.minQaScore,
      metadata: {
        source: "phase39_runtime_policy",
      },
    })),
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    actorId: "runtime-policy",
    actorType: "system",
    action: "RUNTIME_POLICY_RULES_BOOTSTRAPPED",
    entityType: "RuntimePolicyRule",
    severity: "info",
    metadata: {
      count: DEFAULT_RUNTIME_POLICY_RULES.length,
    },
  });

  return prisma.runtimePolicyRule.findMany({
    where: {
      companyId,
      workspaceId: workspaceId || null,
    },
    orderBy: { priority: "asc" },
  });
}

export async function evaluateRuntimePolicy({
  companyId,
  workspaceId,
  projectId,
  projectType = "video",
  actorId = "system-owner",
  actorType = "system",
  resource,
  action,
  metadata,
}: {
  companyId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  projectType?: string | null;
  actorId?: string | null;
  actorType?: string;
  resource: string;
  action: string;
  metadata?: any;
}) {
  await ensureRuntimePolicyRules({
    companyId,
    workspaceId: workspaceId || null,
  });

  const rule =
    (await prisma.runtimePolicyRule.findFirst({
      where: {
        companyId,
        workspaceId: workspaceId || null,
        resource,
        action,
        status: "active",
      },
      orderBy: { priority: "asc" },
    })) ||
    (await prisma.runtimePolicyRule.findFirst({
      where: {
        companyId,
        workspaceId: workspaceId || null,
        resource,
        status: "active",
      },
      orderBy: { priority: "asc" },
    }));

  const checks: any = {
    governance: { required: Boolean(rule?.requireGovernance), ok: true },
    qa: { required: Boolean(rule?.requireQA), ok: true },
    passport: { required: Boolean(rule?.requirePassport), ok: true },
    identity: { required: Boolean(rule?.requireIdentity), ok: true },
    audit: { required: Boolean(rule?.requireAudit), ok: true },
    deployment: { required: Boolean(rule?.requireDeployment), ok: true },
  };

  if (!rule) {
    checks.rule = {
      ok: true,
      reason: "No explicit runtime policy rule matched; allowed by default.",
    };
  }

  if (rule?.requireGovernance) {
    const governance = await authorizeGovernanceAction({
      companyId,
      workspaceId: workspaceId || null,
      actorId,
      actorType,
      resource,
      action,
      metadata: {
        source: "runtime_policy",
        ...(metadata || {}),
      },
    });

    checks.governance = {
      required: true,
      ok: governance.ok,
      status: governance.status,
      reason: governance.reason,
      decisionId: governance.decision?.id,
    };
  }

  if (rule?.requireQA) {
    const qa = await getLatestQA(companyId, projectId || null);
    const minQaScore = safeNumber(rule.minQaScore, 70);
    const score = safeNumber(qa?.overallScore, 0);

    checks.qa = {
      required: true,
      ok: Boolean(qa) && score >= minQaScore && qa?.status !== "blocked",
      score,
      minQaScore,
      status: qa?.status || "missing",
      scorecardId: qa?.id || null,
    };
  }

  if (rule?.requirePassport) {
    const passport = await getPassportStatus(companyId, projectId || null);

    checks.passport = {
      required: true,
      ok: passport.ok,
      passportId: passport.passport?.id || null,
      passportHash: passport.passport?.passportHash || null,
      verificationStatus: passport.verification?.status || "missing",
    };
  }

  if (rule?.requireIdentity) {
    const identity = await getIdentityStatus(companyId, projectId || null);

    checks.identity = {
      required: true,
      ok: identity.ok,
      watermarks: identity.watermarks,
      fingerprints: identity.fingerprints,
    };
  }

  if (rule?.requireAudit) {
    const audit = await verifyAuditChain(companyId);

    checks.audit = {
      required: true,
      ok: audit.ok,
      checkedEvents: audit.checkedEvents,
      issues: audit.issues.length,
    };
  }

  if (rule?.requireDeployment) {
    const deployment = await getDeploymentStatus(companyId);

    checks.deployment = {
      required: true,
      ok: deployment.ok,
      releaseId: deployment.release?.id || null,
      releaseStatus: deployment.release?.status || null,
      deploymentId: deployment.deployment?.id || null,
      deploymentStatus: deployment.deployment?.status || null,
    };
  }

  const failedChecks = Object.entries(checks)
    .filter(([, value]: any) => value?.required && !value?.ok)
    .map(([key]) => key);

  const decision = failedChecks.length ? "block" : "allow";
  const reason = failedChecks.length
    ? `Blocked by sovereign runtime policy: ${failedChecks.join(", ")}`
    : "Allowed by sovereign runtime policy.";

  const record = await prisma.runtimePolicyDecision.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      projectId: projectId || null,
      projectType: projectType || null,
      ruleId: rule?.id || null,
      actorId: actorId || null,
      actorType,
      resource,
      action,
      decision,
      reason,
      checksJson: checks,
      metadata: metadata || {},
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    projectId: projectId || null,
    actorId: actorId || "system-owner",
    actorType,
    action: decision === "allow" ? "RUNTIME_POLICY_ALLOWED" : "RUNTIME_POLICY_BLOCKED",
    entityType: "RuntimePolicyDecision",
    entityId: record.id,
    severity: decision === "allow" ? "info" : "warning",
    metadata: {
      resource,
      action,
      decision,
      reason,
      failedChecks,
      ruleId: rule?.id || null,
    },
  });

  return {
    ok: decision === "allow",
    status: decision === "allow" ? "ALLOWED" : "BLOCKED",
    decision: record,
    rule,
    checks,
    failedChecks,
    reason,
  };
}

export async function getRuntimePolicyDashboard(companyId: string) {
  await ensureRuntimePolicyRules({ companyId });

  const [rules, decisions] = await Promise.all([
    prisma.runtimePolicyRule.findMany({
      where: { companyId },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.runtimePolicyDecision.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        rule: true,
      },
    }),
  ]);

  return {
    ok: true,
    companyId,
    rules,
    decisions,
    summary: {
      rules: rules.length,
      decisions: decisions.length,
      allowed: decisions.filter((item) => item.decision === "allow").length,
      blocked: decisions.filter((item) => item.decision === "block").length,
      activeRules: rules.filter((item) => item.status === "active").length,
      qaRules: rules.filter((item) => item.requireQA).length,
      passportRules: rules.filter((item) => item.requirePassport).length,
      identityRules: rules.filter((item) => item.requireIdentity).length,
      deploymentRules: rules.filter((item) => item.requireDeployment).length,
    },
  };
}
