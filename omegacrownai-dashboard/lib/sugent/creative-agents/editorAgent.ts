import { prisma } from "@/lib/db";
import { createDefaultTimeline, rebuildTimelineJson } from "@/lib/sugent/video/timelineEngine";
import { createProjectVersion, updateProjectVersionStatus } from "@/lib/sugent/versioning/versionEngine";

export async function runEditorPrepareVideoForReview({
  companyId,
  projectId,
  label,
}: {
  companyId: string;
  projectId: string;
  label?: string | null;
}) {
  const timelineResult = await createDefaultTimeline({
    companyId,
    projectId,
  });

  const timelineId = timelineResult.timeline.id;

  const rebuilt = await rebuildTimelineJson(timelineId);

  const version = await createProjectVersion({
    companyId,
    projectId,
    projectType: "video",
    label: label || "Editor prep for review",
  });

  const reviewed = await updateProjectVersionStatus({
    companyId,
    versionId: version.id,
    status: "in_review",
  });

  return {
    ok: true,
    agent: "editor",
    projectType: "video",
    timeline: timelineResult.timeline,
    rebuiltTimeline: rebuilt,
    version: reviewed,
  };
}

export async function runEditorPreparePodcastForReview({
  companyId,
  podcastProjectId,
  label,
}: {
  companyId: string;
  podcastProjectId: string;
  label?: string | null;
}) {
  const version = await createProjectVersion({
    companyId,
    projectId: podcastProjectId,
    projectType: "podcast",
    label: label || "Editor podcast prep for review",
  });

  const reviewed = await updateProjectVersionStatus({
    companyId,
    versionId: version.id,
    status: "in_review",
  });

  return {
    ok: true,
    agent: "editor",
    projectType: "podcast",
    version: reviewed,
  };
}

export async function logEditorDecision({
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
      agentRole: "editor",
      action,
      status: "completed",
      inputJson: inputJson || {},
      outputJson: outputJson || {},
    },
  });
}
