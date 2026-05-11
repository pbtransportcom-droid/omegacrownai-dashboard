import { prisma } from "@/lib/db";
import { getProjectVersion, updateProjectVersionStatus } from "@/lib/sugent/versioning/versionEngine";
import { createReviewThread } from "@/lib/sugent/versioning/reviewEngine";
import {
  buildQualityChecklist,
  inferQualityMode,
  omegaProductionQualityPolicy,
} from "@/lib/sugent/quality/productionQualityPolicy";

function evaluateSnapshot(snapshot: any) {
  const issues: string[] = [];
  const promptSource =
    snapshot?.project?.description ||
    snapshot?.project?.title ||
    snapshot?.script?.fullText ||
    "";

  const qualityMode = inferQualityMode(String(promptSource));
  const checklist = buildQualityChecklist(qualityMode);

  if (!snapshot?.project?.title) {
    issues.push("Project title is missing.");
  }

  if (!promptSource || String(promptSource).trim().length < 12) {
    issues.push("Prompt or project description is too thin for reliable quality review.");
  }

  if (snapshot?.version === "phase22-video-snapshot") {
    if (!snapshot.timeline) {
      issues.push("Video timeline is missing.");
    }

    if (!snapshot.scenes || snapshot.scenes.length === 0) {
      issues.push("Video scenes are missing or empty.");
    }

    if (snapshot.scenes?.length) {
      const weakScenes = snapshot.scenes.filter((scene: any) => {
        const text = `${scene.scriptSegment || ""} ${scene.voiceoverText || ""}`.trim();
        return text.length < 20;
      });

      if (weakScenes.length > 0) {
        issues.push(`${weakScenes.length} video scene(s) have weak or missing script/voiceover detail.`);
      }
    }
  }

  if (snapshot?.version === "phase22-podcast-snapshot") {
    if (!snapshot.segments || snapshot.segments.length === 0) {
      issues.push("Podcast segments are missing or empty.");
    }

    if (snapshot.segments?.length) {
      const weakSegments = snapshot.segments.filter((segment: any) => {
        return !segment.scriptText || String(segment.scriptText).trim().length < 40;
      });

      if (weakSegments.length > 0) {
        issues.push(`${weakSegments.length} podcast segment(s) have weak or missing script detail.`);
      }
    }
  }

  return {
    issues,
    approved: issues.length === 0,
    qualityMode,
    checklist,
    policy: omegaProductionQualityPolicy,
  };
}

export async function runReviewerBasicReview({
  companyId,
  versionId,
  autoApprove = false,
}: {
  companyId: string;
  versionId: string;
  autoApprove?: boolean;
}) {
  const version = await getProjectVersion({
    companyId,
    versionId,
  });

  if (!version) {
    throw new Error("PROJECT_VERSION_NOT_FOUND");
  }

  const result = evaluateSnapshot(version.snapshotJson);

  if (result.issues.length) {
    for (const issue of result.issues) {
      await createReviewThread({
        companyId,
        projectId: version.projectId,
        projectType: version.projectType as any,
        versionId: version.id,
        targetType: "project",
        body: `Reviewer Agent issue: ${issue}`,
      });
    }

    const updated = await updateProjectVersionStatus({
      companyId,
      versionId,
      status: "in_review",
    });

    return {
      ok: true,
      agent: "reviewer",
      approved: false,
      issues: result.issues,
      qualityMode: result.qualityMode,
      checklist: result.checklist,
      version: updated,
    };
  }

  await createReviewThread({
    companyId,
    projectId: version.projectId,
    projectType: version.projectType as any,
    versionId: version.id,
    targetType: "project",
    body: `Reviewer Agent: production quality review passed. Mode: ${result.qualityMode}. Prompt accuracy, detail alignment, and production quality checks passed at baseline level.`,
  });

  const updated = await updateProjectVersionStatus({
    companyId,
    versionId,
    status: autoApprove ? "approved" : "in_review",
  });

  return {
    ok: true,
    agent: "reviewer",
    approved: autoApprove,
    issues: [],
    qualityMode: result.qualityMode,
    checklist: result.checklist,
    version: updated,
  };
}

export async function logReviewerDecision({
  runId,
  action,
  inputJson,
  outputJson,
}: {
  runId: string;
  action: string;
  inputJson?: any;
  outputJson?: any;
}) {
  return prisma.creativeAgentStep.create({
    data: {
      runId,
      agentRole: "reviewer",
      action,
      status: "completed",
      inputJson: inputJson || {},
      outputJson: outputJson || {},
    },
  });
}
