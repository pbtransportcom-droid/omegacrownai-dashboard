import { prisma } from "@/lib/db";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";
import { createQAScorecardForVersion } from "@/lib/sugent/quality/qaScorecardEngine";
import { evaluateRuntimePolicy } from "@/lib/sugent/runtime-policy/runtimePolicyEngine";

function safeNumber(value: any, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeStatus(score: number, targetScore: number) {
  return score >= targetScore ? "passed" : "blocked";
}

async function getOrCreateProjectVersion({
  companyId,
  projectId,
  projectType = "video",
}: {
  companyId: string;
  projectId: string;
  projectType?: string;
}) {
  const existing = await prisma.projectVersion.findFirst({
    where: {
      companyId,
      projectId,
      projectType,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing;

  return prisma.projectVersion.create({
    data: {
      companyId,
      projectId,
      projectType,
      label: "Auto-created QA improvement version",
      status: "draft",
      snapshotJson: {
        source: "qa_improvement_loop",
        reason: "ProjectVersion was missing during QA improvement.",
        projectId,
        projectType,
        createdAt: new Date().toISOString(),
      },
    },
  });
}

async function getLatestQA(companyId: string, versionId: string) {
  return prisma.qAScorecard.findFirst({
    where: {
      companyId,
      versionId,
    },
    orderBy: { createdAt: "desc" },
  });
}

function buildImprovementPlan({
  qa,
  targetScore,
}: {
  qa: any;
  targetScore: number;
}) {
  const score = safeNumber(qa?.overallScore, 0);
  const missing = Math.max(targetScore - score, 0);

  const baseActions: Array<{
    actionType: string;
    priority: string;
    reason: string;
    patchJson: Record<string, any>;
  }> = [
    {
      actionType: "IMPROVE_PROMPT_ACCURACY",
      priority: "high",
      reason: "Improve image/video/content alignment with the original prompt and requested details.",
      patchJson: {
        promptAccuracyBoost: true,
        requireExactPromptDetails: true,
        requireScenePromptTrace: true,
      },
    },
    {
      actionType: "IMPROVE_FACTUAL_LEGENDARY_CONSISTENCY",
      priority: "high",
      reason: "Strengthen factual accuracy for factual outputs and legendary consistency for mythic/cinematic outputs.",
      patchJson: {
        factualConsistencyRequired: true,
        legendaryConsistencyRequired: true,
        requireClaimsCheck: true,
      },
    },
    {
      actionType: "IMPROVE_PRODUCTION_QUALITY",
      priority: "high",
      reason: "Raise production quality, polish, pacing, brand alignment, and readiness for render/publish.",
      patchJson: {
        productionQualityRequired: true,
        polishLevel: "premium",
        brandAlignmentRequired: true,
      },
    },
  ];

  if (missing >= 20) {
    baseActions.push({
      actionType: "REBUILD_VERSION_SNAPSHOT",
      priority: "high",
      reason: "QA score is significantly below target; rebuild the version snapshot with stronger quality gates.",
      patchJson: {
        rebuildRecommended: true,
        targetScore,
        currentScore: score,
      },
    });
  }

  return baseActions;
}

async function applyImprovementPatch({
  version,
  action,
  attempt,
}: {
  version: any;
  action: any;
  attempt: number;
}) {
  const snapshot = (version.snapshotJson || {}) as any;

  const qualityPatches = Array.isArray(snapshot.qualityPatches)
    ? snapshot.qualityPatches
    : [];

  const nextSnapshot = {
    ...snapshot,
    qualityRepair: {
      enabled: true,
      lastAttempt: attempt,
      updatedAt: new Date().toISOString(),
    },
    qualityPatches: [
      ...qualityPatches,
      {
        attempt,
        actionType: action.actionType,
        priority: action.priority,
        reason: action.reason,
        patch: action.patchJson || {},
        appliedAt: new Date().toISOString(),
      },
    ],
    qaRequirements: {
      promptAccuracy: "strict",
      factualConsistency: "strict",
      legendaryConsistency: "strict",
      productionQuality: "premium",
      brandAlignment: "strict",
      minimumRuntimeScore: 80,
    },
  };

  return prisma.projectVersion.update({
    where: { id: version.id },
    data: {
      snapshotJson: nextSnapshot,
      status: "review_ready",
      label: version.label || "QA improved version",
    },
  });
}

export async function runQAImprovementLoop({
  companyId,
  workspaceId,
  projectId,
  projectType = "video",
  actorId = "qa-improvement",
  actorType = "system",
  targetScore = 80,
  maxAttempts = 3,
}: {
  companyId: string;
  workspaceId?: string | null;
  projectId: string;
  projectType?: string;
  actorId?: string | null;
  actorType?: string;
  targetScore?: number;
  maxAttempts?: number;
}) {
  const version = await getOrCreateProjectVersion({
    companyId,
    projectId,
    projectType,
  });

  let qa = await getLatestQA(companyId, version.id);

  if (!qa) {
    qa = await createQAScorecardForVersion({
      companyId,
      versionId: version.id,
    });
  }

  const initialScore = safeNumber(qa?.overallScore, 0);
  const initialStatus = qa?.status || normalizeStatus(initialScore, targetScore);

  const run = await prisma.qAImprovementRun.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      projectId,
      projectType,
      versionId: version.id,
      status: "running",
      targetScore,
      maxAttempts,
      attempt: 0,
      initialScore,
      initialStatus,
      actorId: actorId || null,
      actorType,
      startedAt: new Date(),
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    projectId,
    actorId: actorId || "qa-improvement",
    actorType,
    action: "QA_IMPROVEMENT_STARTED",
    entityType: "QAImprovementRun",
    entityId: run.id,
    severity: "info",
    metadata: {
      projectId,
      versionId: version.id,
      initialScore,
      targetScore,
      maxAttempts,
    },
  });

  let currentVersion = version;
  let currentQA = qa;
  let currentScore = initialScore;
  let currentStatus = initialStatus;
  const allActions: any[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (currentScore >= targetScore && currentStatus !== "blocked") break;

    const plan = buildImprovementPlan({
      qa: currentQA,
      targetScore,
    });

    await prisma.qAImprovementRun.update({
      where: { id: run.id },
      data: {
        attempt,
        improvementPlanJson: plan,
      },
    });

    for (const item of plan) {
      const action = await prisma.qAImprovementAction.create({
        data: {
          runId: run.id,
          companyId,
          projectId,
          versionId: currentVersion.id,
          actionType: item.actionType,
          status: "running",
          priority: item.priority,
          reason: item.reason,
          patchJson: item.patchJson,
          startedAt: new Date(),
        },
      });

      try {
        currentVersion = await applyImprovementPatch({
          version: currentVersion,
          action: item,
          attempt,
        });

        const completed = await prisma.qAImprovementAction.update({
          where: { id: action.id },
          data: {
            status: "completed",
            completedAt: new Date(),
            resultJson: {
              versionId: currentVersion.id,
              snapshotUpdated: true,
            },
          },
        });

        allActions.push(completed);
      } catch (error: any) {
        const failed = await prisma.qAImprovementAction.update({
          where: { id: action.id },
          data: {
            status: "failed",
            completedAt: new Date(),
            error: error?.message || "Unknown QA improvement error.",
          },
        });

        allActions.push(failed);
      }
    }

    currentQA = await createQAScorecardForVersion({
      companyId,
      versionId: currentVersion.id,
    });

    currentScore = safeNumber(currentQA?.overallScore, 0);
    currentStatus = currentQA?.status || normalizeStatus(currentScore, targetScore);
  }

  const finalEvaluation = await evaluateRuntimePolicy({
    companyId,
    workspaceId: workspaceId || null,
    projectId,
    projectType,
    actorId,
    actorType,
    resource: "runtime",
    action: "publish",
    metadata: {
      source: "qa_improvement_final_evaluation",
      qaImprovementRunId: run.id,
    },
  });

  const finalStatus =
    finalEvaluation.ok
      ? "repaired"
      : currentScore >= targetScore
        ? "quality_passed_policy_blocked"
        : "qa_blocked";

  const completedRun = await prisma.qAImprovementRun.update({
    where: { id: run.id },
    data: {
      status: finalStatus,
      finalScore: currentScore,
      finalStatus: currentStatus,
      completedAt: new Date(),
      resultJson: {
        actions: allActions,
        latestQA: currentQA,
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
    projectId,
    actorId: actorId || "qa-improvement",
    actorType,
    action: finalEvaluation.ok ? "QA_IMPROVEMENT_COMPLETED" : "QA_IMPROVEMENT_BLOCKED",
    entityType: "QAImprovementRun",
    entityId: run.id,
    severity: finalEvaluation.ok ? "info" : "warning",
    metadata: {
      runId: run.id,
      initialScore,
      finalScore: currentScore,
      targetScore,
      finalPolicyStatus: finalEvaluation.status,
      failedChecks: finalEvaluation.failedChecks || [],
    },
  });

  return {
    ok: finalEvaluation.ok,
    status: finalStatus,
    run: completedRun,
    latestQA: currentQA,
    finalEvaluation,
  };
}

export async function getQAImprovementDashboard(companyId: string) {
  const runs = await prisma.qAImprovementRun.findMany({
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
      qaBlocked: runs.filter((item) => item.status === "qa_blocked").length,
      qualityPassedPolicyBlocked: runs.filter((item) => item.status === "quality_passed_policy_blocked").length,
      running: runs.filter((item) => item.status === "running").length,
      failedActions: runs.flatMap((item) => item.actions).filter((action) => action.status === "failed").length,
      bestScore: runs.reduce((max, item) => Math.max(max, item.finalScore || item.initialScore || 0), 0),
    },
  };
}
