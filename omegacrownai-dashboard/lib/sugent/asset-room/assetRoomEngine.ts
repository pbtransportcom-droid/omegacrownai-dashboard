import { prisma } from "@/lib/db";

type AssetAgentType = "image" | "video" | "avatar" | "voice" | "music";

function safeJson(obj: any) {
  return JSON.stringify(obj, null, 2);
}

function assetText(asset: any) {
  return String(asset?.metadata?.promptSeed || asset?.metadata?.text || asset?.label || "");
}

function normalizeVideoSource(project: any) {
  return {
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      durationSeconds: project.durationSeconds,
      aspectRatio: project.aspectRatio,
      status: project.status,
    },
    scenes: project.scenes || [],
    assets: project.assets || [],
    existingAssetSummary: (project.assets || []).map((asset: any) => ({
      id: asset.id,
      type: asset.type,
      label: asset.label,
      sceneId: asset.sceneId,
      placeholder: asset.placeholder,
      text: assetText(asset),
    })),
  };
}

function normalizePodcastSource(project: any) {
  return {
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
    },
    segments: project.segments || [],
    existingAssetSummary: (project.segments || []).map((segment: any) => ({
      id: segment.id,
      type: "podcast_segment",
      title: segment.title,
      voiceAssetId: segment.voiceAssetId,
      text: segment.scriptText || "",
    })),
  };
}

function evaluateAssetAgent(agentType: AssetAgentType, source: any) {
  const scenes = source.scenes || [];
  const segments = source.segments || [];
  const existingAssets = source.existingAssetSummary || [];

  if (agentType === "image") {
    const missingVisuals = scenes.filter((scene: any) => {
      return !existingAssets.some((asset: any) => asset.sceneId === scene.id && String(asset.type).includes("visual"));
    });

    return {
      position: missingVisuals.length ? "Image asset coverage needs improvement." : "Image coverage has a usable baseline.",
      issues: missingVisuals.map((scene: any) => ({
        type: "MISSING_IMAGE_ASSET",
        severity: "MEDIUM",
        sceneId: scene.id,
        description: `Scene ${scene.index + 1} needs prompt-accurate visual coverage.`,
        proposed_fix: "Create an internal image generation job using the scene voiceover/script as the prompt seed.",
      })),
      recommendations: [
        "Generate one accurate primary visual per scene.",
        "Preserve the exact prompt details, not just a generic AI/futuristic look.",
        "Use premium cinematic composition, royal/sovereign visual language when requested.",
      ],
    };
  }

  if (agentType === "video") {
    return {
      position: "Video clip generation should focus on short, accurate b-roll.",
      issues: scenes.length
        ? []
        : [
            {
              type: "MISSING_SCENES",
              severity: "HIGH",
              description: "No scenes exist for video clip planning.",
              proposed_fix: "Create scenes before planning video clips.",
            },
          ],
      recommendations: [
        "Create short b-roll clips for high-impact scenes only.",
        "Use slow zoom, command-center movement, dashboard motion, and automation loop visuals.",
        "Keep clip duration aligned to timeline pacing.",
      ],
    };
  }

  if (agentType === "avatar") {
    return {
      position: "Avatar should be optional and used only when it improves explanation.",
      issues: [],
      recommendations: [
        "Use avatar presenter for explainer or educational sections only.",
        "Avoid avatar if cinematic b-roll and voiceover communicate better.",
        "If used, avatar should feel premium, executive, calm, and brand-safe.",
      ],
    };
  }

  if (agentType === "voice") {
    const voiceMissingVideo = scenes.filter((scene: any) => !scene.voiceoverText && !scene.scriptSegment);
    const voiceMissingPodcast = segments.filter((segment: any) => !segment.scriptText);

    return {
      position: voiceMissingVideo.length || voiceMissingPodcast.length ? "Voice assets need stronger text coverage." : "Voice generation can be planned.",
      issues: [
        ...voiceMissingVideo.map((scene: any) => ({
          type: "MISSING_VOICE_TEXT",
          severity: "HIGH",
          sceneId: scene.id,
          description: `Scene ${scene.index + 1} has no voice text.`,
          proposed_fix: "Create speakable narration text before voice generation.",
        })),
        ...voiceMissingPodcast.map((segment: any) => ({
          type: "MISSING_VOICE_TEXT",
          severity: "HIGH",
          segmentId: segment.id,
          description: "Podcast segment has no voice script text.",
          proposed_fix: "Create speakable podcast script before voice generation.",
        })),
      ],
      recommendations: [
        "Generate voice assets from final reviewed voiceover text.",
        "Use confident premium executive delivery.",
        "Keep pacing clear and accessible.",
      ],
    };
  }

  return {
    position: "Music generation should support emotion without overpowering voice.",
    issues: [],
    recommendations: [
      "Generate cinematic modern orchestral-electronic background music.",
      "Use low intensity under narration and a subtle lift near CTA.",
      "Make music loopable and compatible with ducking.",
    ],
  };
}

function synthesizeAssetPlan({
  evaluations,
  source,
}: {
  evaluations: Record<string, any>;
  source: any;
}) {
  const allIssues = Object.entries(evaluations).flatMap(([agent, evaluation]) =>
    (evaluation.issues || []).map((issue: any) => ({
      ...issue,
      agent,
    }))
  );

  const highIssues = allIssues.filter((issue: any) => issue.severity === "HIGH");
  const scenes = source.scenes || [];
  const segments = source.segments || [];

  const queueItems: any[] = [];

  for (const scene of scenes) {
    const sceneText = `${scene.title || ""} ${scene.scriptSegment || ""} ${scene.voiceoverText || ""}`.trim();

    queueItems.push({
      type: "IMAGE_GENERATION",
      priority: "high",
      sceneId: scene.id,
      prompt: sceneText || `Create a premium visual for scene ${scene.index + 1}.`,
      metadata: {
        source: "asset_room",
        accuracyRequired: true,
        qualityStandard: "production_grade",
      },
    });

    queueItems.push({
      type: "VOICE_GENERATION",
      priority: "high",
      sceneId: scene.id,
      prompt: scene.voiceoverText || scene.scriptSegment || "",
      metadata: {
        source: "asset_room",
        voiceStyle: "premium executive clear",
      },
    });
  }

  if (scenes.length > 0) {
    queueItems.push({
      type: "MUSIC_GENERATION",
      priority: "medium",
      prompt: "Create premium cinematic orchestral-electronic background music for OmegaCrownAI, ducked under narration, confident and sovereign.",
      metadata: {
        source: "asset_room",
        loopable: true,
        duckingRequired: true,
      },
    });
  }

  for (const segment of segments) {
    queueItems.push({
      type: "VOICE_GENERATION",
      priority: "high",
      segmentId: segment.id,
      prompt: segment.scriptText || "",
      metadata: {
        source: "asset_room",
        voiceStyle: "podcast host clear premium",
      },
    });
  }

  const assetPlan = [
    {
      id: "image-plan",
      layer: "image",
      action: "CREATE_SCENE_VISUALS",
      priority: "high",
      direction: "Generate prompt-accurate primary visuals for each scene with premium cinematic composition.",
    },
    {
      id: "video-plan",
      layer: "video",
      action: "CREATE_OPTIONAL_BROLL",
      priority: "medium",
      direction: "Generate short internal b-roll clips for high-impact scenes only.",
    },
    {
      id: "avatar-plan",
      layer: "avatar",
      action: "USE_ONLY_IF_NEEDED",
      priority: "low",
      direction: "Use avatar presenter only when it improves clarity.",
    },
    {
      id: "voice-plan",
      layer: "voice",
      action: "GENERATE_VOICE_ASSETS",
      priority: "high",
      direction: "Generate clear, premium, speakable voice tracks from reviewed narration.",
    },
    {
      id: "music-plan",
      layer: "music",
      action: "GENERATE_BACKGROUND_MUSIC",
      priority: "medium",
      direction: "Generate cinematic support music with ducking and loopability.",
    },
    ...allIssues.map((issue: any, index: number) => ({
      id: `asset-fix-${index + 1}`,
      layer: issue.agent,
      action:
        issue.type === "MISSING_IMAGE_ASSET"
          ? "CREATE_IMAGE_JOB"
          : issue.type === "MISSING_VOICE_TEXT"
            ? "CREATE_OR_REPAIR_VOICE_TEXT"
            : issue.type === "MISSING_SCENES"
              ? "CREATE_SCENE_STRUCTURE"
              : "REVIEW_ASSET_ISSUE",
      priority: issue.severity === "HIGH" ? "high" : issue.severity === "MEDIUM" ? "medium" : "low",
      description: issue.description,
      proposedFix: issue.proposed_fix,
    })),
  ];

  const consensus = highIssues.length === 0;

  const summary = [
    consensus ? "Asset generation consensus reached. No high-severity blockers remain." : "Asset generation consensus not reached. High-severity blockers must be resolved.",
    "",
    `Queue items planned: ${queueItems.length}`,
    `Total asset issues: ${allIssues.length}`,
    `High-severity issues: ${highIssues.length}`,
    "",
    "Coordinator priorities:",
    "- Prompt accuracy is mandatory.",
    "- Factual outputs must stay factual.",
    "- Legendary/cinematic outputs must preserve mythic/cinematic detail.",
    "- Voice clarity and brand quality remain approval gates.",
    "- Generation jobs are internal placeholders until native models are attached.",
  ].join("\n");

  return {
    summary,
    assetPlan,
    queueItems,
    consensus,
  };
}

export async function startAssetRoomSession({
  companyId,
  workspaceId,
  projectId,
  projectType = "video",
  topic,
}: {
  companyId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  projectType?: "video" | "podcast";
  topic?: string | null;
}) {
  const session = await prisma.assetGeneratorRoomSession.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      projectId: projectId || null,
      projectType,
      topic: topic || "Asset generation planning",
      status: "open",
      metadata: {
        source: "phase34_asset_generator_room",
      },
    },
  });

  await runAssetRoomRound({
    sessionId: session.id,
  });

  return getAssetRoomSession(session.id);
}

export async function runAssetRoomRound({
  sessionId,
}: {
  sessionId: string;
}) {
  const session = await prisma.assetGeneratorRoomSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      rounds: {
        orderBy: { index: "desc" },
        take: 1,
      },
    },
  });

  let source: any = {
    project: {
      id: session.projectId,
      title: session.topic,
      status: "unattached",
    },
    scenes: [],
    segments: [],
    assets: [],
    existingAssetSummary: [],
  };

  if (session.projectId && session.projectType === "podcast") {
    const podcast = await prisma.podcastProject.findFirst({
      where: {
        id: session.projectId,
        companyId: session.companyId,
      },
      include: {
        segments: {
          orderBy: { index: "asc" },
        },
      },
    });

    if (podcast) source = normalizePodcastSource(podcast);
  }

  if (session.projectId && session.projectType === "video") {
    const video = await prisma.videoProject.findFirst({
      where: {
        id: session.projectId,
        companyId: session.companyId,
      },
      include: {
        scenes: {
          orderBy: { index: "asc" },
        },
        assets: true,
      },
    });

    if (video) source = normalizeVideoSource(video);
  }

  const index = session.rounds[0] ? session.rounds[0].index + 1 : 0;

  const round = await prisma.assetGeneratorRoomRound.create({
    data: {
      sessionId,
      index,
      sourceJson: source,
    },
  });

  const evaluations = {
    image: evaluateAssetAgent("image", source),
    video: evaluateAssetAgent("video", source),
    avatar: evaluateAssetAgent("avatar", source),
    voice: evaluateAssetAgent("voice", source),
    music: evaluateAssetAgent("music", source),
  };

  await prisma.assetGeneratorRoomMessage.createMany({
    data: Object.entries(evaluations).map(([agentType, evaluation]) => ({
      roundId: round.id,
      role: "agent",
      agentType,
      content: safeJson(evaluation),
      parsedJson: evaluation,
    })),
  });

  const coordinator = synthesizeAssetPlan({
    evaluations,
    source,
  });

  await prisma.assetGeneratorRoomMessage.create({
    data: {
      roundId: round.id,
      role: "coordinator",
      agentType: "coordinator",
      content: coordinator.summary,
      parsedJson: coordinator,
    },
  });

  const updatedRound = await prisma.assetGeneratorRoomRound.update({
    where: { id: round.id },
    data: {
      summary: coordinator.summary,
      assetPlanJson: {
        assetPlan: coordinator.assetPlan,
        queueItems: coordinator.queueItems,
      },
      consensus: coordinator.consensus,
    },
  });

  if (coordinator.consensus) {
    await prisma.assetGeneratorRoomSession.update({
      where: { id: session.id },
      data: {
        status: "consensus_reached",
        metadata: {
          ...(session.metadata as any || {}),
          consensusRoundId: round.id,
        },
      },
    });
  }

  return updatedRound;
}

export async function enqueueAssetRoomPlan({
  sessionId,
}: {
  sessionId: string;
}) {
  const session = await prisma.assetGeneratorRoomSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      rounds: {
        orderBy: { index: "desc" },
        take: 1,
      },
    },
  });

  const latestRound = session.rounds[0];
  const plan: any = latestRound?.assetPlanJson || {};
  const queueItems = Array.isArray(plan.queueItems) ? plan.queueItems : [];

  if (!queueItems.length) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "No queue items exist in latest asset plan.",
    };
  }

  const createdJobs = [];

  for (const item of queueItems) {
    const job = await prisma.job.create({
      data: {
        companyId: session.companyId,
        workspaceId: session.workspaceId || null,
        type: String(item.type || "ASSET_GENERATION"),
        payload: {
          ...item,
          projectId: session.projectId,
          projectType: session.projectType,
          assetRoomSessionId: session.id,
          source: "asset_generator_room",
        },
        status: "pending",
        maxAttempts: 3,
        scheduledAt: new Date(),
      },
    });

    createdJobs.push(job);
  }

  await prisma.assetGeneratorRoomSession.update({
    where: { id: session.id },
    data: {
      status: "queued",
      metadata: {
        ...(session.metadata as any || {}),
        queuedAt: new Date().toISOString(),
        queuedJobs: createdJobs.map((job) => job.id),
      },
    },
  });

  return {
    ok: true,
    status: "QUEUED",
    jobs: createdJobs,
  };
}

export async function getAssetRoomSession(sessionId: string) {
  return prisma.assetGeneratorRoomSession.findUnique({
    where: { id: sessionId },
    include: {
      rounds: {
        orderBy: { index: "asc" },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
}

export async function listAssetRoomSessions(companyId: string) {
  const sessions = await prisma.assetGeneratorRoomSession.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      rounds: {
        orderBy: { index: "desc" },
        take: 1,
        include: {
          messages: true,
        },
      },
    },
  });

  return {
    ok: true,
    companyId,
    sessions,
    summary: {
      total: sessions.length,
      open: sessions.filter((s) => s.status === "open").length,
      consensus: sessions.filter((s) => s.status === "consensus_reached").length,
      queued: sessions.filter((s) => s.status === "queued").length,
      video: sessions.filter((s) => s.projectType === "video").length,
      podcast: sessions.filter((s) => s.projectType === "podcast").length,
    },
  };
}
