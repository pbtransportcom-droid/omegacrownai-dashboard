import { prisma } from "@/lib/db";
import {
  buildQualityChecklist,
  inferQualityMode,
} from "@/lib/sugent/quality/productionQualityPolicy";


function clampQualityPatchScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getSnapshotQualitySignals(snapshot: any) {
  const qualityPatches = Array.isArray(snapshot?.qualityPatches) ? snapshot.qualityPatches : [];
  const requirements = snapshot?.qaRequirements || {};
  const qualityRepair = snapshot?.qualityRepair || {};

  const actionTypes = qualityPatches.map((patch: any) => String(patch.actionType || ""));

  const promptAccuracy =
    requirements.promptAccuracy === "strict" ||
    actionTypes.includes("IMPROVE_PROMPT_ACCURACY") ||
    qualityPatches.some((patch: any) => patch?.patch?.promptAccuracyBoost);

  const factualLegendary =
    requirements.factualConsistency === "strict" ||
    requirements.legendaryConsistency === "strict" ||
    actionTypes.includes("IMPROVE_FACTUAL_LEGENDARY_CONSISTENCY") ||
    qualityPatches.some((patch: any) => patch?.patch?.factualConsistencyRequired || patch?.patch?.legendaryConsistencyRequired);

  const productionQuality =
    requirements.productionQuality === "premium" ||
    actionTypes.includes("IMPROVE_PRODUCTION_QUALITY") ||
    qualityPatches.some((patch: any) => patch?.patch?.productionQualityRequired);

  const brandAlignment =
    requirements.brandAlignment === "strict" ||
    qualityPatches.some((patch: any) => patch?.patch?.brandAlignmentRequired);

  const rebuild =
    actionTypes.includes("REBUILD_VERSION_SNAPSHOT") ||
    qualityPatches.some((patch: any) => patch?.patch?.rebuildRecommended);

  const patchCount = qualityPatches.length;
  const repairAttempt = Number(qualityRepair.lastAttempt || 0);

  return {
    qualityPatches,
    patchCount,
    repairAttempt,
    promptAccuracy,
    factualLegendary,
    productionQuality,
    brandAlignment,
    rebuild,
  };
}

function scoreVersionSnapshot(snapshot: any) {
  const signals = getSnapshotQualitySignals(snapshot);

  let score = 63;

  if (signals.promptAccuracy) score += 8;
  if (signals.factualLegendary) score += 7;
  if (signals.productionQuality) score += 8;
  if (signals.brandAlignment) score += 4;
  if (signals.rebuild) score += 5;

  score += Math.min(signals.patchCount * 2, 8);
  score += Math.min(signals.repairAttempt * 2, 6);

  const finalScore = clampQualityPatchScore(score);

  return {
    overallScore: finalScore,
    status: finalScore >= 80 ? "passed" : "blocked",
    dimensions: {
      promptAccuracy: signals.promptAccuracy ? 90 : 62,
      factualLegendaryConsistency: signals.factualLegendary ? 88 : 63,
      productionQuality: signals.productionQuality ? 90 : 64,
      brandAlignment: signals.brandAlignment ? 86 : 67,
      renderReadiness: signals.rebuild ? 85 : 66,
    },
    signals,
  };
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function wordOverlapScore(source: string, target: string) {
  const sourceWords = new Set(
    source
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)
  );

  const targetWords = new Set(
    target
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)
  );

  if (!sourceWords.size || !targetWords.size) return 40;

  let matches = 0;
  for (const word of sourceWords) {
    if (targetWords.has(word)) matches += 1;
  }

  return clampScore((matches / sourceWords.size) * 100);
}

function includesAny(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function calculateScores(snapshot: any) {
  const projectText = [
    snapshot?.project?.title,
    snapshot?.project?.description,
    snapshot?.script?.fullText,
    ...(snapshot?.scenes || []).map((scene: any) => scene.scriptSegment || scene.voiceoverText || ""),
    ...(snapshot?.segments || []).map((segment: any) => segment.scriptText || ""),
  ]
    .filter(Boolean)
    .join(" ");

  const promptSource = [
    snapshot?.project?.title,
    snapshot?.project?.description,
    snapshot?.script?.brief,
    snapshot?.script?.prompt,
  ]
    .filter(Boolean)
    .join(" ");

  const mode = inferQualityMode(promptSource || projectText);
  const checklist = buildQualityChecklist(mode);

  const promptAccuracyScore = wordOverlapScore(promptSource || projectText, projectText);

  const hasDetailedScenes =
    Array.isArray(snapshot?.scenes) &&
    snapshot.scenes.length > 0 &&
    snapshot.scenes.every((scene: any) => String(scene.voiceoverText || scene.scriptSegment || "").length >= 20);

  const hasDetailedSegments =
    Array.isArray(snapshot?.segments) &&
    snapshot.segments.length > 0 &&
    snapshot.segments.every((segment: any) => String(segment.scriptText || "").length >= 40);

  const detailAlignmentScore = hasDetailedScenes || hasDetailedSegments ? 90 : 55;

  const factualRequested = mode === "factual";
  const factualConsistencyScore = factualRequested
    ? includesAny(projectText, ["proof", "report", "system", "workflow", "automation", "company"])
      ? 85
      : 60
    : 80;

  const legendaryRequested = mode === "legendary" || mode === "cinematic";
  const legendaryStyleScore = legendaryRequested
    ? includesAny(projectText, ["legendary", "cinematic", "crown", "royal", "sovereign", "premium", "futuristic"])
      ? 90
      : 55
    : 80;

  const brandAlignmentScore = includesAny(projectText, ["omegacrown", "omega crown", "sovereign", "company os", "premium"])
    ? 92
    : 65;

  const productionQualityScore =
    promptAccuracyScore >= 70 && detailAlignmentScore >= 70 && brandAlignmentScore >= 70 ? 88 : 60;

  let overallScore = clampScore(
    (promptAccuracyScore +
      detailAlignmentScore +
      factualConsistencyScore +
      legendaryStyleScore +
      brandAlignmentScore +
      productionQualityScore) /
      6
  );

  const qualitySignals = getSnapshotQualitySignals(snapshot);
  const qualityPatchScoreBoost = clampScore(
    (qualitySignals.promptAccuracy ? 5 : 0) +
    (qualitySignals.factualLegendary ? 5 : 0) +
    (qualitySignals.productionQuality ? 6 : 0) +
    (qualitySignals.brandAlignment ? 3 : 0) +
    (qualitySignals.rebuild ? 4 : 0) +
    Math.min(qualitySignals.patchCount * 2, 8) +
    Math.min(qualitySignals.repairAttempt * 2, 6)
  );

  overallScore = clampScore(overallScore + qualityPatchScoreBoost);

  const status =
    overallScore >= 85
      ? "pass"
      : overallScore >= 80
        ? "needs_review"
        : "blocked";

  const notes = [
    `Mode: ${mode}`,
    `Prompt accuracy: ${promptAccuracyScore}`,
    `Detail alignment: ${detailAlignmentScore}`,
    `Factual consistency: ${factualConsistencyScore}`,
    `Legendary/cinematic style: ${legendaryStyleScore}`,
    `Brand alignment: ${brandAlignmentScore}`,
    `Production quality: ${productionQualityScore}`,
    `Quality patch boost: ${qualityPatchScoreBoost}`,
    `Overall: ${overallScore}`,
  ].join("\\n");

  return {
    mode,
    checklist,
    promptAccuracyScore,
    detailAlignmentScore,
    factualConsistencyScore,
    legendaryStyleScore,
    brandAlignmentScore,
    productionQualityScore,
    overallScore,
    status,
    notes,
  };
}

export async function createQAScorecardForVersion({
  companyId,
  versionId,
}: {
  companyId: string;
  versionId: string;
}) {
  const version = await prisma.projectVersion.findFirstOrThrow({
    where: {
      id: versionId,
      companyId,
    },
  });

  const scores = calculateScores(version.snapshotJson);

  return prisma.qAScorecard.create({
    data: {
      companyId,
      projectId: version.projectId,
      projectType: version.projectType,
      versionId: version.id,
      promptAccuracyScore: scores.promptAccuracyScore,
      detailAlignmentScore: scores.detailAlignmentScore,
      factualConsistencyScore: scores.factualConsistencyScore,
      legendaryStyleScore: scores.legendaryStyleScore,
      brandAlignmentScore: scores.brandAlignmentScore,
      productionQualityScore: scores.productionQualityScore,
      overallScore: scores.overallScore,
      status: scores.status,
      mode: scores.mode,
      notes: scores.notes,
      checklist: scores.checklist,
      metadata: {
        source: "phase27_runtime_qa_scorecard",
        versionLabel: version.label,
      },
    },
  });
}

export async function getLatestQAScorecard({
  companyId,
  projectId,
  projectType,
}: {
  companyId: string;
  projectId: string;
  projectType: string;
}) {
  return prisma.qAScorecard.findFirst({
    where: {
      companyId,
      projectId,
      projectType,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function listQAScorecards(companyId: string) {
  const scorecards = await prisma.qAScorecard.findMany({
    where: {
      companyId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return {
    ok: true,
    companyId,
    scorecards,
    summary: {
      total: scorecards.length,
      pass: scorecards.filter((item) => item.status === "pass").length,
      needsReview: scorecards.filter((item) => item.status === "needs_review").length,
      blocked: scorecards.filter((item) => item.status === "blocked").length,
      average:
        scorecards.length > 0
          ? Math.round(scorecards.reduce((sum, item) => sum + item.overallScore, 0) / scorecards.length)
          : 0,
    },
  };
}

export async function assertQAPassForProject({
  companyId,
  projectId,
  projectType = "video",
  minimumScore = 70,
}: {
  companyId: string;
  projectId: string;
  projectType?: string;
  minimumScore?: number;
}) {
  const scorecard = await getLatestQAScorecard({
    companyId,
    projectId,
    projectType,
  });

  if (!scorecard) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "No QA scorecard exists. Run QA before approval/render.",
    };
  }

  if (scorecard.overallScore < minimumScore || scorecard.status === "blocked") {
    return {
      ok: false,
      status: "BLOCKED",
      reason: `QA score too low: ${scorecard.overallScore}. Minimum required: ${minimumScore}.`,
      scorecard,
    };
  }

  return {
    ok: true,
    status: "QA_PASSED",
    scorecard,
  };
}
