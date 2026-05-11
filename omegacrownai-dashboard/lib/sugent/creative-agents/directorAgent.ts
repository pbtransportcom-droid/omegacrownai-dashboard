import { prisma } from "@/lib/db";
import { createVideoProject } from "@/lib/sugent/video/engine";
import { createAssetGenerationJobs } from "@/lib/sugent/video/assetEngine";
import { createPodcastProject, generatePodcastVoiceJobs } from "@/lib/sugent/podcast/podcastEngine";

export async function runDirectorVideoPlan({
  companyId,
  brief,
  title,
  campaignId,
  includeAssets = true,
}: {
  companyId: string;
  brief: string;
  title?: string | null;
  campaignId?: string | null;
  includeAssets?: boolean;
}) {
  const project = await createVideoProject({
    companyId,
    campaignId: campaignId || null,
    title: title || "Director Agent Video Project",
    description: brief,
    objective: brief,
    offer: "OmegaCrown AI Company OS",
    audience: { segment: "business owners, creators, and operators" },
    channels: ["website", "social", "email"],
    aspectRatio: "16:9",
    tone: "premium, confident, cinematic",
  });

  let assetJobs: any[] = [];

  if (includeAssets && project?.id) {
    assetJobs = await createAssetGenerationJobs({
      companyId,
      projectId: project.id,
      includeVideo: true,
      includeAvatar: false,
      includeMusic: true,
    });
  }

  return {
    ok: true,
    agent: "director",
    projectType: "video",
    project,
    assetJobs,
  };
}

export async function runDirectorPodcastPlan({
  companyId,
  brief,
  title,
  campaignId,
  includeVoiceJobs = true,
}: {
  companyId: string;
  brief: string;
  title?: string | null;
  campaignId?: string | null;
  includeVoiceJobs?: boolean;
}) {
  const podcast = await createPodcastProject({
    companyId,
    campaignId: campaignId || null,
    title: title || "Director Agent Podcast Episode",
    description: brief,
    tone: "premium, confident, educational",
    language: "en",
  });

  let voiceJobs: any[] = [];

  if (includeVoiceJobs && podcast?.id) {
    voiceJobs = await generatePodcastVoiceJobs({
      companyId,
      podcastProjectId: podcast.id,
    });
  }

  return {
    ok: true,
    agent: "director",
    projectType: "podcast",
    project: podcast,
    voiceJobs,
  };
}

export async function logDirectorDecision({
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
      agentRole: "director",
      action,
      status: "completed",
      inputJson: inputJson || {},
      outputJson: outputJson || {},
    },
  });
}
