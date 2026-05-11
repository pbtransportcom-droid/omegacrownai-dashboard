import { prisma } from "@/lib/db";
import { getProjectVersion, updateProjectVersionStatus } from "@/lib/sugent/versioning/versionEngine";
import { createReviewThread } from "@/lib/sugent/versioning/reviewEngine";

function evaluateSnapshot(snapshot: any) {
  const issues: string[] = [];

  if (!snapshot?.project?.title) {
    issues.push("Project title is missing.");
  }

  if (snapshot?.version === "phase22-video-snapshot") {
    if (!snapshot.timeline) {
      issues.push("Video timeline is missing.");
    }

    if (!snapshot.scenes || snapshot.scenes.length === 0) {
      issues.push("Video scenes are missing or empty.");
    }
  }

  if (snapshot?.version === "phase22-podcast-snapshot") {
    if (!snapshot.segments || snapshot.segments.length === 0) {
      issues.push("Podcast segments are missing or empty.");
    }
  }

  return {
    issues,
    approved: issues.length === 0,
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
      version: updated,
    };
  }

  await createReviewThread({
    companyId,
    projectId: version.projectId,
    projectType: version.projectType as any,
    versionId: version.id,
    targetType: "project",
    body: "Reviewer Agent: basic review passed. No critical blockers found.",
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
