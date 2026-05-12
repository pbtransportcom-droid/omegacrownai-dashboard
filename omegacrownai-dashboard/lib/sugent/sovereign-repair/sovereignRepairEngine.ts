import { prisma } from "@/lib/db";
import { recordAuditEvent, verifyAuditChain } from "@/lib/sugent/audit/auditEngine";
import { evaluateRuntimePolicy } from "@/lib/sugent/runtime-policy/runtimePolicyEngine";
import { createQAScorecardForVersion } from "@/lib/sugent/quality/qaScorecardEngine";
import { issueCompanyPassport, issueProjectPassport } from "@/lib/sugent/passport/passportEngine";
import { protectProjectAssets } from "@/lib/sugent/identity/platformIdentityEngine";
import { ensureGovernanceTenant, createGovernanceRoleAssignment } from "@/lib/sugent/governance/governanceEngine";
import { ensureDeploymentProfile, createReleaseBundle, approveReleaseBundle, deployReleaseBundle } from "@/lib/sugent/deployment/deploymentEngine";

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

async function findLatestProjectVersion(companyId: string, projectId?: string | null) {
  if (!projectId) return null;

  const existing = await prisma.projectVersion.findFirst({
    where: {
      companyId,
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existing) return existing;

  return prisma.projectVersion.create({
    data: {
      companyId,
      projectId,
      projectType: "video",
      label: "Auto-created QA repair version",
      status: "draft",
      snapshotJson: {
        source: "sovereign_repair",
        reason: "ProjectVersion was missing during QA repair.",
        projectId,
        repairVersion: `repair-${Date.now()}`,
        title: "Auto-created QA repair version",
      },
    },
  });
}

async function repairQA({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId?: string | null;
}) {
  const version = await findLatestProjectVersion(companyId, projectId);

  if (!version) {
    return {
      ok: false,
      status: "NO_PROJECT_VERSION",
      reason: "No project version exists for QA repair.",
    };
  }

  const qa = await createQAScorecardForVersion({
    companyId,
    versionId: version.id,
  });

  return {
    ok: true,
    status: "QA_REPAIRED",
    versionId: version.id,
    qa,
  };
}

async function repairPassport({
  companyId,
  workspaceId,
  projectId,
  projectType,
  actorId,
}: {
  companyId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  projectType?: string | null;
  actorId?: string | null;
}) {
  const companyPassport = await issueCompanyPassport({
    companyId,
    workspaceId: workspaceId || null,
    issuedBy: actorId || "sovereign-repair",
  });

  let projectPassport: any = null;

  if (projectId) {
    projectPassport = await issueProjectPassport({
      companyId,
      workspaceId: workspaceId || null,
      projectId,
      projectType: projectType === "podcast" ? "podcast" : "video",
      issuedBy: actorId || "sovereign-repair",
    });
  }

  return {
    ok: Boolean(companyPassport.ok && (!projectId || projectPassport?.ok)),
    status: "PASSPORT_REPAIRED",
    companyPassport,
    projectPassport,
  };
}

async function repairIdentity({
  companyId,
  projectId,
  projectType,
}: {
  companyId: string;
  projectId?: string | null;
  projectType?: string | null;
}) {
  if (!projectId) {
    return {
      ok: false,
      status: "NO_PROJECT_ID",
      reason: "Project ID required for identity repair.",
    };
  }

  return protectProjectAssets({
    companyId,
    projectId,
    projectType: projectType === "podcast" ? "podcast" : "video",
  });
}

async function repairAudit({
  companyId,
}: {
  companyId: string;
}) {
  const chain = await verifyAuditChain(companyId);

  if (chain.ok) {
    return {
      ok: true,
      status: "AUDIT_ALREADY_VALID",
      chain,
    };
  }

  await recordAuditEvent({
    companyId,
    actorId: "sovereign-repair",
    actorType: "system",
    action: "AUDIT_CHAIN_REPAIR_ATTEMPTED",
    entityType: "AuditEvent",
    severity: "warning",
    metadata: {
      issues: chain.issues,
      checkedEvents: chain.checkedEvents,
      note: "Tamper-evident audit chains cannot be silently rewritten; repair records the issue for review.",
    },
  });

  return {
    ok: false,
    status: "AUDIT_REQUIRES_MANUAL_REVIEW",
    chain,
  };
}

async function repairGovernance({
  companyId,
  workspaceId,
  actorId,
  actorType,
}: {
  companyId: string;
  workspaceId?: string | null;
  actorId?: string | null;
  actorType?: string;
}) {
  const tenant = await ensureGovernanceTenant({
    companyId,
    workspaceId: workspaceId || null,
  });

  let assignment: any = null;

  if (actorId) {
    assignment = await createGovernanceRoleAssignment({
      companyId,
      workspaceId: workspaceId || null,
      actorId,
      actorType: actorType || "system",
      roleSlug: "sovereign_owner",
    });
  }

  return {
    ok: true,
    status: "GOVERNANCE_REPAIRED",
    tenant,
    assignment,
  };
}

async function repairDeployment({
  companyId,
  workspaceId,
  actorId,
  actorType,
}: {
  companyId: string;
  workspaceId?: string | null;
  actorId?: string | null;
  actorType?: string;
}) {
  const profile = await ensureDeploymentProfile({
    companyId,
    workspaceId: workspaceId || null,
    name: "OmegaCrownAI Auto-Repaired Production Profile",
    environment: "production",
  });

  const releaseResult = await createReleaseBundle({
    companyId,
    workspaceId: workspaceId || null,
    profileId: profile.id,
    name: "OmegaCrownAI Auto-Repair Release",
    version: `repair-${Date.now()}`,
    sourceRef: "main",
    commitHash: "sovereign-repair",
    actorId: actorId || "system-owner",
    actorType: actorType || "system",
  });

  if (!releaseResult.ok || !releaseResult.release?.id) {
    return {
      ok: false,
      status: "RELEASE_CREATE_FAILED",
      profile,
      releaseResult,
    };
  }

  const releaseId = releaseResult.release.id;

  const approved = await approveReleaseBundle({
    companyId,
    releaseId,
    actorId: actorId || "system-owner",
    actorType: actorType || "system",
  });

  if (!approved.ok) {
    return {
      ok: false,
      status: "RELEASE_APPROVAL_FAILED",
      profile,
      releaseResult,
      approved,
    };
  }

  const deployed = await deployReleaseBundle({
    companyId,
    releaseId,
    actorId: actorId || "system-owner",
    actorType: actorType || "system",
  });

  return {
    ok: deployed.ok,
    status: deployed.ok ? "DEPLOYMENT_REPAIRED" : "DEPLOYMENT_REPAIR_FAILED",
    profile,
    releaseResult,
    approved,
    deployed,
  };
}

export function buildRepairPlan(failedChecks: string[]) {
  let checks = unique(failedChecks);

  if (checks.includes("passport") && !checks.includes("identity")) {
    checks = ["identity", ...checks];
  }

  return checks.map((checkName) => {
    const actionType =
      checkName === "qa"
        ? "RUN_QA_SCORECARD"
        : checkName === "passport"
          ? "ISSUE_AND_VERIFY_PASSPORT"
          : checkName === "identity"
            ? "CREATE_WATERMARKS_AND_FINGERPRINTS"
            : checkName === "audit"
              ? "VERIFY_OR_RECORD_AUDIT_ISSUE"
              : checkName === "deployment"
                ? "CREATE_APPROVE_DEPLOY_RELEASE"
                : checkName === "governance"
                  ? "BOOTSTRAP_GOVERNANCE_AUTHORITY"
                  : "UNKNOWN_REPAIR";

    return {
      checkName,
      actionType,
      status: "planned",
    };
  });
}

export async function runSovereignPolicyRepair({
  companyId,
  workspaceId,
  projectId,
  projectType = "video",
  actorId = "system-owner",
  actorType = "system",
  resource = "runtime",
  action = "publish",
  failedChecks,
  triggerType = "manual",
}: {
  companyId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  projectType?: string | null;
  actorId?: string | null;
  actorType?: string;
  resource?: string;
  action?: string;
  failedChecks?: string[];
  triggerType?: string;
}) {
  let initialEvaluation: any = null;
  let checksToRepair = failedChecks || [];

  if (!checksToRepair.length) {
    initialEvaluation = await evaluateRuntimePolicy({
      companyId,
      workspaceId: workspaceId || null,
      projectId: projectId || null,
      projectType: projectType || "video",
      actorId,
      actorType,
      resource,
      action,
      metadata: {
        source: "sovereign_repair_initial_evaluation",
      },
    });

    checksToRepair = initialEvaluation.failedChecks || [];
  }

  const repairPlan = buildRepairPlan(checksToRepair);

  const run = await prisma.sovereignRepairRun.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      projectId: projectId || null,
      projectType: projectType || null,
      status: "running",
      triggerType,
      failedChecks: checksToRepair,
      repairPlanJson: repairPlan,
      actorId: actorId || null,
      actorType,
      startedAt: new Date(),
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    projectId: projectId || null,
    actorId: actorId || "system-owner",
    actorType,
    action: "SOVEREIGN_REPAIR_STARTED",
    entityType: "SovereignRepairRun",
    entityId: run.id,
    severity: "info",
    metadata: {
      failedChecks: checksToRepair,
      resource,
      action,
    },
  });

  const actionResults = [];

  for (const item of repairPlan) {
    const actionRecord = await prisma.sovereignRepairAction.create({
      data: {
        runId: run.id,
        companyId,
        workspaceId: workspaceId || null,
        projectId: projectId || null,
        projectType: projectType || null,
        checkName: item.checkName,
        actionType: item.actionType,
        status: "running",
        startedAt: new Date(),
      },
    });

    let result: any = null;

    try {
      if (item.checkName === "qa") {
        result = await repairQA({ companyId, projectId: projectId || null });
      } else if (item.checkName === "passport") {
        result = await repairPassport({
          companyId,
          workspaceId: workspaceId || null,
          projectId: projectId || null,
          projectType: projectType || "video",
          actorId,
        });
      } else if (item.checkName === "identity") {
        result = await repairIdentity({
          companyId,
          projectId: projectId || null,
          projectType: projectType || "video",
        });
      } else if (item.checkName === "audit") {
        result = await repairAudit({ companyId });
      } else if (item.checkName === "deployment") {
        result = await repairDeployment({
          companyId,
          workspaceId: workspaceId || null,
          actorId,
          actorType,
        });
      } else if (item.checkName === "governance") {
        result = await repairGovernance({
          companyId,
          workspaceId: workspaceId || null,
          actorId,
          actorType,
        });
      } else {
        result = {
          ok: false,
          status: "UNKNOWN_CHECK",
          reason: `No repair handler exists for ${item.checkName}`,
        };
      }

      const updatedAction = await prisma.sovereignRepairAction.update({
        where: { id: actionRecord.id },
        data: {
          status: result?.ok ? "completed" : "failed",
          resultJson: result || {},
          error: result?.ok ? null : result?.reason || result?.status || "Repair action failed.",
          completedAt: new Date(),
        },
      });

      actionResults.push(updatedAction);
    } catch (error: any) {
      const updatedAction = await prisma.sovereignRepairAction.update({
        where: { id: actionRecord.id },
        data: {
          status: "failed",
          error: error?.message || "Unknown repair error.",
          completedAt: new Date(),
        },
      });

      actionResults.push(updatedAction);
    }
  }

  const finalEvaluation = await evaluateRuntimePolicy({
    companyId,
    workspaceId: workspaceId || null,
    projectId: projectId || null,
    projectType: projectType || "video",
    actorId,
    actorType,
    resource,
    action,
    metadata: {
      source: "sovereign_repair_final_evaluation",
      repairRunId: run.id,
    },
  });

  const failedActions = actionResults.filter((item: any) => item.status !== "completed");

  const finalStatus = finalEvaluation.ok
    ? "repaired"
    : failedActions.length
      ? "partial"
      : "blocked";

  const completedRun = await prisma.sovereignRepairRun.update({
    where: { id: run.id },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      resultJson: {
        initialEvaluation,
        actions: actionResults,
        finalEvaluation,
      },
      error: finalEvaluation.ok ? null : finalEvaluation.reason,
    },
    include: {
      actions: true,
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    projectId: projectId || null,
    actorId: actorId || "system-owner",
    actorType,
    action: finalEvaluation.ok ? "SOVEREIGN_REPAIR_COMPLETED" : "SOVEREIGN_REPAIR_PARTIAL",
    entityType: "SovereignRepairRun",
    entityId: run.id,
    severity: finalEvaluation.ok ? "info" : "warning",
    metadata: {
      repairRunId: run.id,
      status: finalStatus,
      finalPolicyStatus: finalEvaluation.status,
      failedChecks: finalEvaluation.failedChecks || [],
    },
  });

  return {
    ok: finalEvaluation.ok,
    status: finalStatus,
    run: completedRun,
    finalEvaluation,
  };
}

export async function getSovereignRepairDashboard(companyId: string) {
  const runs = await prisma.sovereignRepairRun.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    ok: true,
    companyId,
    runs,
    summary: {
      runs: runs.length,
      repaired: runs.filter((item) => item.status === "repaired").length,
      partial: runs.filter((item) => item.status === "partial").length,
      blocked: runs.filter((item) => item.status === "blocked").length,
      running: runs.filter((item) => item.status === "running").length,
      failedActions: runs.flatMap((item) => item.actions).filter((action) => action.status === "failed").length,
    },
  };
}
