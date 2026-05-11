import { prisma } from "@/lib/db";
import { runDirectorVideoPlan, runDirectorPodcastPlan, logDirectorDecision } from "@/lib/sugent/creative-agents/directorAgent";
import { runEditorPrepareVideoForReview, runEditorPreparePodcastForReview, logEditorDecision } from "@/lib/sugent/creative-agents/editorAgent";
import { runReviewerBasicReview, logReviewerDecision } from "@/lib/sugent/creative-agents/reviewerAgent";

export async function runCreativeStudioFlow({
  companyId,
  mode = "video",
  brief,
  title,
  campaignId,
  autoApprove = false,
}: {
  companyId: string;
  mode?: "video" | "podcast";
  brief: string;
  title?: string | null;
  campaignId?: string | null;
  autoApprove?: boolean;
}) {
  const run = await prisma.creativeAgentRun.create({
    data: {
      companyId,
      projectType: mode,
      agentRole: "coordinator",
      status: "running",
      startedAt: new Date(),
      inputJson: {
        mode,
        brief,
        title,
        campaignId,
        autoApprove,
      },
    },
  });

  try {
    let directorResult: any;
    let editorResult: any;
    let reviewerResult: any;

    if (mode === "podcast") {
      directorResult = await runDirectorPodcastPlan({
        companyId,
        brief,
        title,
        campaignId,
        includeVoiceJobs: true,
      });

      await logDirectorDecision({
        runId: run.id,
        action: "create_podcast_project",
        inputJson: { brief, title, campaignId },
        outputJson: directorResult,
      });

      const podcastProjectId = directorResult.project.id;

      editorResult = await runEditorPreparePodcastForReview({
        companyId,
        podcastProjectId,
        label: "Agent Editor podcast prep for review",
      });

      await logEditorDecision({
        runId: run.id,
        action: "prepare_podcast_for_review",
        inputJson: { podcastProjectId },
        outputJson: editorResult,
      });

      reviewerResult = await runReviewerBasicReview({
        companyId,
        versionId: editorResult.version.id,
        autoApprove,
      });

      await logReviewerDecision({
        runId: run.id,
        action: "review_podcast_version",
        inputJson: { versionId: editorResult.version.id },
        outputJson: reviewerResult,
      });

      await prisma.creativeAgentRun.update({
        where: { id: run.id },
        data: {
          projectId: podcastProjectId,
          status: "completed",
          completedAt: new Date(),
          outputJson: {
            directorResult,
            editorResult,
            reviewerResult,
          },
        },
      });

      return getCreativeAgentRun(run.id);
    }

    directorResult = await runDirectorVideoPlan({
      companyId,
      brief,
      title,
      campaignId,
      includeAssets: true,
    });

    await logDirectorDecision({
      runId: run.id,
      action: "create_video_project",
      inputJson: { brief, title, campaignId },
      outputJson: directorResult,
    });

    const videoProjectId = directorResult.project.id;

    editorResult = await runEditorPrepareVideoForReview({
      companyId,
      projectId: videoProjectId,
      label: "Agent Editor video prep for review",
    });

    await logEditorDecision({
      runId: run.id,
      action: "prepare_video_for_review",
      inputJson: { projectId: videoProjectId },
      outputJson: editorResult,
    });

    reviewerResult = await runReviewerBasicReview({
      companyId,
      versionId: editorResult.version.id,
      autoApprove,
    });

    await logReviewerDecision({
      runId: run.id,
      action: "review_video_version",
      inputJson: { versionId: editorResult.version.id },
      outputJson: reviewerResult,
    });

    await prisma.creativeAgentRun.update({
      where: { id: run.id },
      data: {
        projectId: videoProjectId,
        status: "completed",
        completedAt: new Date(),
        outputJson: {
          directorResult,
          editorResult,
          reviewerResult,
        },
      },
    });

    return getCreativeAgentRun(run.id);
  } catch (error: any) {
    await prisma.creativeAgentRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        errorMessage: error?.message || "Unknown creative agent error",
      },
    });

    return getCreativeAgentRun(run.id);
  }
}

export async function getCreativeAgentRun(runId: string) {
  return prisma.creativeAgentRun.findUnique({
    where: { id: runId },
    include: {
      steps: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getCreativeStudioDashboard(companyId: string) {
  const runs = await prisma.creativeAgentRun.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      steps: {
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
      completed: runs.filter((run) => run.status === "completed").length,
      failed: runs.filter((run) => run.status === "failed").length,
      running: runs.filter((run) => run.status === "running").length,
      video: runs.filter((run) => run.projectType === "video").length,
      podcast: runs.filter((run) => run.projectType === "podcast").length,
    },
  };
}
