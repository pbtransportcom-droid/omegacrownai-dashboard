import { prisma } from "@/lib/db";

type CreatePodcastInput = {
  companyId: string;
  campaignId?: string | null;
  title: string;
  description?: string | null;
  tone?: string | null;
  language?: string | null;
};

function estimateDuration(text: string, fallback = 60) {
  const words = String(text || "").split(/\s+/).filter(Boolean).length;
  return Math.max(20, Math.ceil(words / 2.2) || fallback);
}

function createOutline({
  title,
  description,
  tone,
}: {
  title: string;
  description?: string | null;
  tone?: string | null;
}) {
  return {
    version: "phase20-podcast-outline",
    format: "audio_first",
    tone: tone || "professional, premium, confident",
    title,
    description: description || "",
    segments: [
      {
        index: 0,
        type: "intro",
        title: "Intro",
        durationSec: 45,
        objective: "Open the episode, establish the promise, and introduce the topic.",
      },
      {
        index: 1,
        type: "main",
        title: "Main Story",
        durationSec: 240,
        objective: "Explain the core topic with clear business value and practical examples.",
      },
      {
        index: 2,
        type: "insight",
        title: "Key Insight",
        durationSec: 120,
        objective: "Deliver the strongest insight, lesson, or strategic takeaway.",
      },
      {
        index: 3,
        type: "cta",
        title: "Call To Action",
        durationSec: 45,
        objective: "Close with a premium OmegaCrown AI call to action.",
      },
    ],
  };
}

function generateSegmentScript({
  projectTitle,
  projectDescription,
  segment,
  tone,
}: {
  projectTitle: string;
  projectDescription?: string | null;
  segment: any;
  tone?: string | null;
}) {
  const voice = tone || "professional, premium, confident";

  if (segment.type === "intro") {
    return `Welcome to OmegaCrown AI. Today we are talking about ${projectTitle}. In this episode, we will explore why this matters, what problem it solves, and how a sovereign AI operating system can help businesses move faster with clarity and control.`;
  }

  if (segment.type === "main") {
    return `The main idea is simple: ${projectDescription || projectTitle}. Most businesses lose time because their tools, teams, and automation are disconnected. OmegaCrown AI brings structure to that chaos by organizing work through departments, memory, tasks, execution loops, dashboards, and executive reporting. The tone is ${voice}, and the goal is to make the listener understand the value quickly.`;
  }

  if (segment.type === "insight") {
    return `The key insight is that AI becomes more powerful when it is not just a chatbot. It becomes more powerful when it acts like an operating system. A true AI company OS can plan, execute, measure, remember, and improve. That is the difference between using AI and building with AI.`;
  }

  return `If you are ready to build a smarter company workflow, OmegaCrown AI gives you the foundation. Start with one campaign, one department, or one automation loop, then expand into a full autonomous company system.`;
}

export async function createPodcastProject(input: CreatePodcastInput) {
  const outlineJson = createOutline({
    title: input.title,
    description: input.description,
    tone: input.tone,
  });

  const durationSeconds = outlineJson.segments.reduce(
    (sum, segment) => sum + Number(segment.durationSec || 0),
    0
  );

  const project = await prisma.podcastProject.create({
    data: {
      companyId: input.companyId,
      campaignId: input.campaignId || null,
      title: input.title,
      description: input.description || null,
      status: "draft",
      language: input.language || "en",
      tone: input.tone || "premium",
      durationSeconds,
    },
  });

  const outline = await prisma.podcastOutline.create({
    data: {
      projectId: project.id,
      structureJson: outlineJson,
    },
  });

  await prisma.podcastProject.update({
    where: { id: project.id },
    data: { outlineId: outline.id },
  });

  for (const segment of outlineJson.segments) {
    const scriptText = generateSegmentScript({
      projectTitle: input.title,
      projectDescription: input.description,
      segment,
      tone: input.tone,
    });

    await prisma.podcastSegment.create({
      data: {
        projectId: project.id,
        index: segment.index,
        type: segment.type,
        title: segment.title,
        scriptText,
        durationSec: estimateDuration(scriptText, segment.durationSec),
        metadata: {
          objective: segment.objective,
          source: "phase20_podcast_engine",
        },
      },
    });
  }

  return getPodcastProject(project.id, input.companyId);
}

export async function createPodcastFromCampaign({
  companyId,
  campaignId,
}: {
  companyId: string;
  campaignId: string;
}) {
  const campaign = await prisma.marketingCampaign.findFirstOrThrow({
    where: { id: campaignId, companyId },
  });

  return createPodcastProject({
    companyId,
    campaignId,
    title: `${campaign.name} Podcast Episode`,
    description: campaign.objective || campaign.offer || "OmegaCrown AI podcast episode.",
    tone: "premium, confident, educational",
    language: "en",
  });
}

export async function generatePodcastVoiceJobs({
  companyId,
  podcastProjectId,
}: {
  companyId: string;
  podcastProjectId: string;
}) {
  const podcast = await prisma.podcastProject.findFirstOrThrow({
    where: {
      id: podcastProjectId,
      companyId,
    },
    include: {
      segments: {
        orderBy: { index: "asc" },
      },
    },
  });

  const parentProject = await prisma.project.findUnique({
    where: { id: podcastProjectId },
    select: { id: true },
  });

  if (!parentProject) {
    return [];
  }

  const parentProject = await prisma.project.findUnique({
    where: { id: podcastProjectId },
    select: { id: true },
  });

  if (!parentProject) {
    return [];
  }

  const jobs = [];

  for (const segment of podcast.segments) {
    jobs.push(
      prisma.assetGenerationJob.create({
        data: {
          projectId: podcastProjectId,
          sceneId: null,
          type: "podcast_voice",
          status: "queued",
          prompt: segment.scriptText || "",
          modelId: "omega-native-podcast-voice-v0",
          logs: {
            source: "phase20_podcast_voice_generation",
            podcastProjectId: podcast.id,
            podcastSegmentId: segment.id,
            segmentTitle: segment.title,
          },
        },
      })
    );
  }

  jobs.push(
    prisma.assetGenerationJob.create({
      data: {
        projectId: podcastProjectId,
        type: "podcast_music",
        status: "queued",
        prompt: `Create premium podcast intro/outro music for: ${podcast.title}`,
        modelId: "omega-native-podcast-music-v0",
        logs: {
          source: "phase20_podcast_music_generation",
          podcastProjectId: podcast.id,
        },
      },
    })
  );

  return Promise.all(jobs);
}

export async function createPodcastAudioRenderJob({
  companyId,
  podcastProjectId,
}: {
  companyId: string;
  podcastProjectId: string;
}) {
  const podcast = await prisma.podcastProject.findFirstOrThrow({
    where: {
      id: podcastProjectId,
      companyId,
    },
  });

  const pseudoVideoProject = await prisma.videoProject.create({
    data: {
      companyId,
      title: `${podcast.title} Audio Render`,
      description: podcast.description || null,
      status: "ready_for_render",
      aspectRatio: "audio",
      durationSeconds: podcast.durationSeconds || null,
      brandOverlay: {
        source: "podcast_mode",
        podcastProjectId: podcast.id,
      },
    },
  });

  const timeline = await prisma.videoTimeline.create({
    data: {
      projectId: pseudoVideoProject.id,
      fps: 30,
      durationSeconds: podcast.durationSeconds || 0,
      structureJson: {
        version: "phase20-podcast-audio-timeline",
        podcastProjectId: podcast.id,
        tracks: [
          {
            id: "podcast-audio-track",
            type: "audio",
            clips: [],
          },
        ],
      },
    },
  });

  await prisma.videoProject.update({
    where: { id: pseudoVideoProject.id },
    data: { timelineId: timeline.id },
  });

  return prisma.renderJob.create({
    data: {
      projectId: pseudoVideoProject.id,
      type: "audio_only",
      status: "queued",
      targetFormat: "mp3",
      resolution: null,
      fps: null,
      bitrateKbps: 192,
      logs: {
        source: "phase20_podcast_audio_render",
        podcastProjectId: podcast.id,
      },
    },
  });
}

export async function getPodcastDashboard(companyId: string) {
  const projects = await prisma.podcastProject.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      outline: true,
      segments: {
        orderBy: { index: "asc" },
        include: {
          voiceAsset: true,
        },
      },
    },
  });

  return {
    ok: true,
    companyId,
    projects,
    summary: {
      projects: projects.length,
      draft: projects.filter((project) => project.status === "draft").length,
      ready: projects.filter((project) => project.status === "ready").length,
      rendered: projects.filter((project) => project.status === "rendered").length,
      segments: projects.reduce((sum, project) => sum + project.segments.length, 0),
      durationSeconds: projects.reduce((sum, project) => sum + (project.durationSeconds || 0), 0),
    },
  };
}

export async function getPodcastProject(projectId: string, companyId: string) {
  return prisma.podcastProject.findFirst({
    where: {
      id: projectId,
      companyId,
    },
    include: {
      outline: true,
      segments: {
        orderBy: { index: "asc" },
        include: {
          voiceAsset: true,
        },
      },
    },
  });
}
