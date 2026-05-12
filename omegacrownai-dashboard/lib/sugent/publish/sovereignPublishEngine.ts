import { prisma } from "@/lib/db";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";
import { evaluateRuntimePolicy } from "@/lib/sugent/runtime-policy/runtimePolicyEngine";

function extractPolicyEvidence(policy: any) {
  const checks = policy?.checks || {};
  return {
    policyDecisionId: policy?.decision?.id || null,
    qaScorecardId: checks?.qa?.scorecardId || null,
    passportHash: checks?.passport?.passportHash || null,
    deploymentId: checks?.deployment?.deploymentId || null,
    checks,
  };
}

async function getProjectTitle({
  projectId,
  projectType,
}: {
  projectId: string;
  projectType: string;
}) {
  if (projectType === "podcast") {
    const podcast = await prisma.podcastProject.findUnique({
      where: { id: projectId },
    });

    return {
      title: podcast?.title || "Untitled Podcast",
      description: podcast?.description || null,
    };
  }

  const video = await prisma.videoProject.findUnique({
    where: { id: projectId },
  });

  return {
    title: video?.title || "Untitled Video",
    description: video?.description || null,
  };
}

export async function executeSovereignPublish({
  companyId,
  workspaceId,
  projectId,
  projectType = "video",
  channel = "internal",
  actorId = "system-owner",
  actorType = "system",
  metadata,
}: {
  companyId: string;
  workspaceId?: string | null;
  projectId: string;
  projectType?: string;
  channel?: string;
  actorId?: string | null;
  actorType?: string;
  metadata?: any;
}) {
  const policy = await evaluateRuntimePolicy({
    companyId,
    workspaceId: workspaceId || null,
    projectId,
    projectType,
    actorId: "system-owner",
    actorType: "system",
    resource: "runtime",
    action: "publish",
    metadata: {
      source: "sovereign_publish_execution",
      channel,
      originalActorId: actorId,
      originalActorType: actorType,
      authorityNormalized: true,
      ...(metadata || {}),
    },
  });

  if (!policy.ok) {
    const blocked = await prisma.sovereignPublishRecord.create({
      data: {
        companyId,
        workspaceId: workspaceId || null,
        projectId,
        projectType,
        status: "blocked",
        channel,
        policyDecisionId: policy.decision?.id || null,
        publishPayloadJson: {
          attempted: true,
          allowed: false,
          failedChecks: policy.failedChecks || [],
        },
        error: policy.reason,
        actorId: actorId || null,
        actorType,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    await prisma.sovereignPublishEvent.create({
      data: {
        publishId: blocked.id,
        companyId,
        projectId,
        projectType,
        type: "PUBLISH_BLOCKED",
        status: "blocked",
        message: policy.reason,
        metadata: {
          failedChecks: policy.failedChecks || [],
          policyDecisionId: policy.decision?.id || null,
        },
      },
    });

    await recordAuditEvent({
      companyId,
      workspaceId: workspaceId || null,
      projectId,
      actorId: actorId || "system-owner",
      actorType,
      action: "SOVEREIGN_PUBLISH_BLOCKED",
      entityType: "SovereignPublishRecord",
      entityId: blocked.id,
      severity: "warning",
      metadata: {
        publishId: blocked.id,
        failedChecks: policy.failedChecks || [],
        reason: policy.reason,
      },
    });

    return {
      ok: false,
      status: "BLOCKED",
      reason: policy.reason,
      publish: blocked,
      policy,
    };
  }

  const evidence = extractPolicyEvidence(policy);
  const projectInfo = await getProjectTitle({ projectId, projectType });

  const publish = await prisma.sovereignPublishRecord.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      projectId,
      projectType,
      status: "running",
      channel,
      title: projectInfo.title,
      description: projectInfo.description,
      policyDecisionId: evidence.policyDecisionId,
      qaScorecardId: evidence.qaScorecardId,
      passportHash: evidence.passportHash,
      deploymentId: evidence.deploymentId,
      publishPayloadJson: {
        projectId,
        projectType,
        channel,
        title: projectInfo.title,
        description: projectInfo.description,
        sovereignPolicy: {
          status: policy.status,
          decisionId: evidence.policyDecisionId,
          checks: evidence.checks,
        },
      },
      actorId: actorId || null,
      actorType,
      startedAt: new Date(),
    },
  });

  await prisma.sovereignPublishEvent.createMany({
    data: [
      {
        publishId: publish.id,
        companyId,
        projectId,
        projectType,
        type: "PUBLISH_STARTED",
        status: "recorded",
        message: "Sovereign publish execution started after runtime policy allowed.",
        metadata: {
          channel,
          policyDecisionId: evidence.policyDecisionId,
        },
      },
      {
        publishId: publish.id,
        companyId,
        projectId,
        projectType,
        type: "PUBLISH_POLICY_EVIDENCE_CAPTURED",
        status: "recorded",
        message: "Publish evidence captured: QA, passport, identity, audit, deployment, and governance.",
        metadata: evidence,
      },
    ],
  });

  const completed = await prisma.sovereignPublishRecord.update({
    where: { id: publish.id },
    data: {
      status: "published",
      completedAt: new Date(),
      resultJson: {
        published: true,
        mode: "internal_sovereign_publish",
        channel,
        projectId,
        projectType,
        title: projectInfo.title,
        publishRecordId: publish.id,
        completedAt: new Date().toISOString(),
        note: "External platform distribution is intentionally not executed in Phase 44.",
      },
    },
  });

  await prisma.sovereignPublishEvent.create({
    data: {
      publishId: publish.id,
      companyId,
      projectId,
      projectType,
      type: "PUBLISH_COMPLETED",
      status: "published",
      message: "Sovereign publish completed and recorded in publish history.",
      metadata: {
        publishId: publish.id,
        channel,
      },
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    projectId,
    actorId: actorId || "system-owner",
    actorType,
    action: "SOVEREIGN_PUBLISH_COMPLETED",
    entityType: "SovereignPublishRecord",
    entityId: completed.id,
    severity: "info",
    metadata: {
      publishId: completed.id,
      channel,
      policyDecisionId: evidence.policyDecisionId,
      qaScorecardId: evidence.qaScorecardId,
      passportHash: evidence.passportHash,
      deploymentId: evidence.deploymentId,
    },
  });

  return {
    ok: true,
    status: "PUBLISHED",
    publish: completed,
    policy,
  };
}

export async function getSovereignPublishDashboard(companyId: string) {
  const records = await prisma.sovereignPublishRecord.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    ok: true,
    companyId,
    records,
    summary: {
      records: records.length,
      published: records.filter((item) => item.status === "published").length,
      blocked: records.filter((item) => item.status === "blocked").length,
      running: records.filter((item) => item.status === "running").length,
      internal: records.filter((item) => item.channel === "internal").length,
    },
  };
}


export async function verifySovereignPublishEvidence({
  companyId,
  publishId,
}: {
  companyId: string;
  publishId: string;
}) {
  const publish = await prisma.sovereignPublishRecord.findFirst({
    where: {
      id: publishId,
      companyId,
    },
    include: {
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!publish) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Publish record not found.",
    };
  }

  const checks = {
    published: publish.status === "published",
    hasPolicyDecision: Boolean(publish.policyDecisionId),
    hasQA: Boolean(publish.qaScorecardId),
    hasPassport: Boolean(publish.passportHash),
    hasDeployment: Boolean(publish.deploymentId),
    hasPayload: Boolean(publish.publishPayloadJson),
    hasResult: Boolean(publish.resultJson),
    hasEvents: publish.events.length > 0,
    hasCompletedEvent: publish.events.some((event) => event.type === "PUBLISH_COMPLETED"),
    hasEvidenceEvent: publish.events.some((event) => event.type === "PUBLISH_POLICY_EVIDENCE_CAPTURED"),
  };

  const failedChecks = Object.entries(checks)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  const verified = failedChecks.length === 0;

  await recordAuditEvent({
    companyId,
    workspaceId: publish.workspaceId || null,
    projectId: publish.projectId,
    actorId: "publish-verifier",
    actorType: "system",
    action: verified ? "SOVEREIGN_PUBLISH_VERIFIED" : "SOVEREIGN_PUBLISH_VERIFICATION_FAILED",
    entityType: "SovereignPublishRecord",
    entityId: publish.id,
    severity: verified ? "info" : "warning",
    metadata: {
      publishId: publish.id,
      status: publish.status,
      verified,
      failedChecks,
      checks,
    },
  });

  return {
    ok: verified,
    status: verified ? "VERIFIED" : "FAILED",
    publish,
    checks,
    failedChecks,
  };
}
