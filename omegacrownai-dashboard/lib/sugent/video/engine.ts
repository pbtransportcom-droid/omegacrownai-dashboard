import { prisma } from "@/lib/db";

type CreateVideoProjectInput = {
  companyId: string;
  title: string;
  description?: string | null;
  campaignId?: string | null;
  objective?: string | null;
  offer?: string | null;
  audience?: any;
  channels?: any;
  aspectRatio?: string;
  tone?: string | null;
};

function asArray(value: any, fallback: string[]) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return fallback;
}

function estimateSceneDuration(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(5, Math.ceil(words / 2.4));
}

export function generateVideoScript({
  title,
  description,
  objective,
  offer,
  audience,
  channels,
  tone,
}: CreateVideoProjectInput) {
  const audienceName = audience?.segment || audience?.name || "founders, operators, and business owners";
  const channelList = asArray(channels, ["website", "email", "social"]);
  const campaignOffer = offer || "OmegaCrown AI Company OS";
  const voice = tone || "premium, clear, confident, and executive";

  return [
    `Hook: What if your company could run with intelligent departments, workers, memory, and automation?`,
    `Problem: ${audienceName} are losing time switching between tools, manual workflows, and disconnected AI assistants.`,
    `Solution: ${campaignOffer} turns AI into a full company operating system with marketing, sales, finance, operations, support, executive reports, and automation loops.`,
    `Proof: OmegaCrown AI connects campaigns, tasks, departments, KPIs, browser/cloud execution, and executive autopilot into one sovereign workflow.`,
    `CTA: Start building your autonomous company system today through ${channelList.join(", ")}.`,
    `Style note: This video should feel ${voice}. Project: ${title}. ${description || objective || ""}`,
  ].join("\n\n");
}

export function planScenesFromScript(scriptText: string) {
  const segments = scriptText.split(/\n\s*\n/).filter(Boolean);
  let cursor = 0;

  return segments.map((segment, index) => {
    const duration = estimateSceneDuration(segment);
    const scene = {
      index,
      title: `Scene ${index + 1}`,
      scriptSegment: segment.trim(),
      voiceoverText: segment.trim(),
      startTimeSeconds: cursor,
      endTimeSeconds: cursor + duration,
      transitionIn: index === 0 ? "fade_in" : "cut",
      transitionOut: index === segments.length - 1 ? "fade_out" : "cut",
      cameraStyle: index % 2 === 0 ? "slow_zoom" : "pan",
    };

    cursor += duration;
    return scene;
  });
}

function buildBrandOverlay() {
  return {
    logo: {
      enabled: true,
      position: "top-right",
      opacity: 0.9,
      safeZone: "standard",
      assetPath: "/brand/omegacrown-icon.svg",
    },
    lowerThirds: {
      enabled: true,
      style: "premium_dark_gold",
    },
    watermark: {
      enabled: true,
      text: "OmegaCrown AI",
      mode: "legal_visible",
    },
  };
}

function buildTimeline({
  scenes,
  durationSeconds,
}: {
  scenes: Array<{ id: string; index: number; startTimeSeconds: number | null; endTimeSeconds: number | null }>;
  durationSeconds: number;
}) {
  return {
    version: "phase16-linear-timeline",
    fps: 30,
    durationSeconds,
    tracks: [
      {
        id: "video-track-1",
        type: "video",
        clips: scenes.map((scene) => ({
          sceneId: scene.id,
          startTimeSeconds: scene.startTimeSeconds,
          endTimeSeconds: scene.endTimeSeconds,
          source: "placeholder_visual",
        })),
      },
      {
        id: "voice-track-1",
        type: "audio",
        clips: scenes.map((scene) => ({
          sceneId: scene.id,
          startTimeSeconds: scene.startTimeSeconds,
          endTimeSeconds: scene.endTimeSeconds,
          source: "voiceover_text",
        })),
      },
      {
        id: "overlay-track-1",
        type: "overlay",
        clips: scenes.map((scene) => ({
          sceneId: scene.id,
          startTimeSeconds: scene.startTimeSeconds,
          endTimeSeconds: scene.endTimeSeconds,
          source: "brand_overlay_metadata",
        })),
      },
    ],
  };
}

export async function createVideoProject(input: CreateVideoProjectInput) {
  const scriptText = generateVideoScript(input);
  const plannedScenes = planScenesFromScript(scriptText);
  const durationSeconds = plannedScenes.reduce(
    (max, scene) => Math.max(max, scene.endTimeSeconds || 0),
    0
  );

  const project = await prisma.videoProject.create({
    data: {
      companyId: input.companyId,
      campaignId: input.campaignId || null,
      title: input.title,
      description: input.description || input.objective || null,
      status: "planned",
      aspectRatio: input.aspectRatio || "16:9",
      durationSeconds,
      brandOverlay: buildBrandOverlay(),
    },
  });

  const script = await prisma.videoScript.create({
    data: {
      projectId: project.id,
      fullText: scriptText,
      language: "en",
      tone: input.tone || "premium",
      metadata: {
        source: "native_video_studio_phase16",
        campaignId: input.campaignId || null,
      },
    },
  });

  const createdScenes = [];

  for (const scene of plannedScenes) {
    const created = await prisma.videoScene.create({
      data: {
        projectId: project.id,
        index: scene.index,
        title: scene.title,
        scriptSegment: scene.scriptSegment,
        voiceoverText: scene.voiceoverText,
        startTimeSeconds: scene.startTimeSeconds,
        endTimeSeconds: scene.endTimeSeconds,
        transitionIn: scene.transitionIn,
        transitionOut: scene.transitionOut,
        cameraStyle: scene.cameraStyle,
        metadata: {
          phase: 16,
          plannedBy: "native_video_engine",
        },
      },
    });

    createdScenes.push(created);

    await prisma.videoAsset.create({
      data: {
        projectId: project.id,
        sceneId: created.id,
        type: "placeholder_visual",
        label: `Scene ${created.index + 1} primary visual`,
        placeholder: true,
        metadata: {
          futureSource: "internal_image_or_video_model",
          promptSeed: created.scriptSegment,
        },
      },
    });

    await prisma.videoAsset.create({
      data: {
        projectId: project.id,
        sceneId: created.id,
        type: "voiceover_text",
        label: `Scene ${created.index + 1} voiceover text`,
        placeholder: true,
        metadata: {
          futureSource: "internal_tts_engine",
          text: created.voiceoverText,
        },
      },
    });
  }

  const timeline = await prisma.videoTimeline.create({
    data: {
      projectId: project.id,
      fps: 30,
      durationSeconds,
      structureJson: buildTimeline({
        scenes: createdScenes,
        durationSeconds,
      }),
    },
  });

  await prisma.videoProject.update({
    where: { id: project.id },
    data: {
      scriptId: script.id,
      timelineId: timeline.id,
      status: "planned",
    },
  });

  return getVideoProject(project.id, input.companyId);
}

export async function createVideoProjectFromCampaign({
  companyId,
  campaignId,
}: {
  companyId: string;
  campaignId: string;
}) {
  const campaign = await prisma.marketingCampaign.findFirstOrThrow({
    where: {
      id: campaignId,
      companyId,
    },
    include: {
      assets: true,
    },
  });

  return createVideoProject({
    companyId,
    campaignId,
    title: `${campaign.name} Video`,
    description: campaign.objective,
    objective: campaign.objective,
    offer: campaign.offer,
    audience: campaign.audience,
    channels: campaign.channels,
    tone: "premium marketing",
  });
}

export async function getVideoDashboard(companyId: string) {
  const projects = await prisma.videoProject.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      script: true,
      timeline: true,
      scenes: {
        orderBy: { index: "asc" },
        include: {
          assets: true,
        },
      },
      assets: true,
    },
    take: 100,
  });

  return {
    ok: true,
    companyId,
    projects,
    summary: {
      projects: projects.length,
      planned: projects.filter((project) => project.status === "planned").length,
      scenes: projects.reduce((sum, project) => sum + project.scenes.length, 0),
      assets: projects.reduce((sum, project) => sum + project.assets.length, 0),
      durationSeconds: projects.reduce((sum, project) => sum + (project.durationSeconds || 0), 0),
    },
  };
}

export async function getVideoProject(projectId: string, companyId: string) {
  return prisma.videoProject.findFirst({
    where: {
      id: projectId,
      companyId,
    },
    include: {
      script: true,
      timeline: true,
      scenes: {
        orderBy: { index: "asc" },
        include: {
          assets: true,
        },
      },
      assets: true,
    },
  });
}
