import { prisma } from "@/lib/db";

type SoundAgentType = "voice" | "music" | "sfx" | "mix";

function safeJson(obj: any) {
  return JSON.stringify(obj, null, 2);
}

function textFromAsset(asset: any) {
  return String(asset?.metadata?.text || asset?.metadata?.promptSeed || asset?.label || "");
}

function normalizeVideoAudioSnapshot(project: any) {
  const voiceAssets = (project.assets || []).filter((asset: any) => asset.type === "voiceover_text");
  const musicAssets = (project.assets || []).filter((asset: any) => asset.type === "music" || asset.type === "music_job");
  const sfxAssets = (project.assets || []).filter((asset: any) => asset.type === "sfx" || asset.type === "sound_effect");

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
    voiceAssets,
    musicAssets,
    sfxAssets,
    narrationText: voiceAssets.map(textFromAsset).filter(Boolean).join("\n"),
  };
}

function normalizePodcastAudioSnapshot(project: any) {
  const segments = project.segments || [];
  return {
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
    },
    segments,
    narrationText: segments.map((segment: any) => segment.scriptText || "").filter(Boolean).join("\n"),
    voiceAssets: segments.filter((segment: any) => Boolean(segment.voiceAssetId)),
    musicAssets: [],
    sfxAssets: [],
  };
}

function evaluateSoundAgent(agentType: SoundAgentType, snapshot: any) {
  const narration = String(snapshot.narrationText || "");
  const duration = Number(snapshot.project?.durationSeconds || 0);
  const voiceCount = Number(snapshot.voiceAssets?.length || 0);
  const musicCount = Number(snapshot.musicAssets?.length || 0);
  const sfxCount = Number(snapshot.sfxAssets?.length || 0);

  if (agentType === "voice") {
    const issues = [];

    if (!narration.trim()) {
      issues.push({
        type: "MISSING_VOICE_DIRECTION",
        severity: "HIGH",
        description: "No narration or voiceover text is available for audio direction.",
        proposed_fix: "Generate or attach voiceover text before voice production.",
      });
    }

    if (narration.length > 1200) {
      issues.push({
        type: "VOICEOVER_DENSITY",
        severity: "MEDIUM",
        description: "Narration may be too dense for clear delivery.",
        proposed_fix: "Break narration into shorter, speakable phrases with pauses.",
      });
    }

    return {
      position: issues.length ? "Voice direction needs refinement." : "Voice direction has a usable baseline.",
      issues,
      recommendations: [
        "Use a confident, premium, calm executive voice.",
        "Speak with clear pacing and controlled pauses.",
        "Emphasize OmegaCrownAI, sovereign AI company OS, executive command, automation, and production quality.",
      ],
    };
  }

  if (agentType === "music") {
    const issues = [];

    if (musicCount === 0) {
      issues.push({
        type: "MISSING_MUSIC_DIRECTION",
        severity: "MEDIUM",
        description: "No music direction or music placeholder is attached.",
        proposed_fix: "Add a premium cinematic background music direction.",
      });
    }

    return {
      position: musicCount ? "Music layer exists or is planned." : "Music direction should be added.",
      issues,
      recommendations: [
        "Use cinematic, premium, modern orchestral-electronic music.",
        "Keep music under the voice with strong ducking.",
        "Use subtle rise under the hook and confident lift near the CTA.",
      ],
    };
  }

  if (agentType === "sfx") {
    const issues = [];

    if (sfxCount === 0 && duration > 30) {
      issues.push({
        type: "SFX_OPPORTUNITY",
        severity: "LOW",
        description: "No SFX layer exists for transitions or UI/action moments.",
        proposed_fix: "Add restrained premium whooshes, UI ticks, and reveal accents.",
      });
    }

    return {
      position: "SFX should remain subtle and premium.",
      issues,
      recommendations: [
        "Add soft transition whooshes only where scene movement needs emphasis.",
        "Use low-volume UI sounds for dashboard/automation visuals.",
        "Avoid cartoonish, loud, or cluttered effects.",
      ],
    };
  }

  const issues = [];

  if (voiceCount === 0 && !narration.trim()) {
    issues.push({
      type: "MIX_BLOCKER",
      severity: "HIGH",
      description: "Mix cannot be planned fully without voice direction.",
      proposed_fix: "Create voiceover text or voice asset placeholders first.",
    });
  }

  return {
    position: issues.length ? "Mix cannot be production-ready yet." : "Mix can be planned at baseline.",
    issues,
    recommendations: [
      "Target clean voice-forward mix.",
      "Apply music ducking under narration.",
      "Normalize final loudness for web/social playback.",
      "Keep SFX at supporting volume, never competing with voice.",
    ],
    mix_targets: {
      voice: "front_and_clear",
      music: "ducked_under_voice",
      sfx: "subtle_support",
      loudness: "platform_safe_web_social",
    },
  };
}

function synthesizeAudioPlan({
  evaluations,
  snapshot,
}: {
  evaluations: Record<string, any>;
  snapshot: any;
}) {
  const allIssues = Object.entries(evaluations).flatMap(([agent, evaluation]) =>
    (evaluation.issues || []).map((issue: any) => ({
      ...issue,
      agent,
    }))
  );

  const highIssues = allIssues.filter((issue: any) => issue.severity === "HIGH");

  const audioPlan = [
    {
      id: "voice-direction",
      layer: "voice",
      action: "SET_VOICE_DIRECTION",
      priority: "high",
      direction: "Confident, premium, clear executive delivery with controlled pauses and strong emphasis on OmegaCrownAI value points.",
    },
    {
      id: "music-direction",
      layer: "music",
      action: "SET_MUSIC_DIRECTION",
      priority: "medium",
      direction: "Cinematic modern orchestral-electronic bed, low under narration, rising subtly during hook and CTA.",
    },
    {
      id: "sfx-direction",
      layer: "sfx",
      action: "SET_SFX_DIRECTION",
      priority: "low",
      direction: "Restrained premium transition accents and UI sounds only where they support clarity and polish.",
    },
    {
      id: "mix-direction",
      layer: "mix",
      action: "SET_MIX_TARGETS",
      priority: "high",
      direction: "Voice-forward mix with ducked music, subtle SFX, clean loudness normalization, and platform-safe export.",
    },
    ...allIssues.map((issue: any, index: number) => ({
      id: `audio-fix-${index + 1}`,
      layer: issue.agent,
      action:
        issue.type === "MISSING_VOICE_DIRECTION"
          ? "CREATE_VOICE_TEXT"
          : issue.type === "VOICEOVER_DENSITY"
            ? "SHORTEN_OR_SPLIT_VOICEOVER"
            : issue.type === "MISSING_MUSIC_DIRECTION"
              ? "ADD_MUSIC_PLACEHOLDER"
              : issue.type === "SFX_OPPORTUNITY"
                ? "ADD_SUBTLE_SFX_CUES"
                : "REVIEW_AUDIO_BLOCKER",
      priority: issue.severity === "HIGH" ? "high" : issue.severity === "MEDIUM" ? "medium" : "low",
      description: issue.description,
      proposedFix: issue.proposed_fix,
    })),
  ];

  const consensus = highIssues.length === 0;

  const summary = [
    consensus ? "Sound design consensus reached. No high-severity audio blockers remain." : "Sound design consensus not reached. High-severity audio blockers must be resolved.",
    "",
    `Total audio issues: ${allIssues.length}`,
    `High-severity issues: ${highIssues.length}`,
    "",
    "Coordinator priorities:",
    "- Voice clarity and accessibility come first.",
    "- Brand tone must remain premium and sovereign.",
    "- Music supports emotion without overpowering speech.",
    "- SFX adds polish but stays restrained.",
    "- Mix targets remain voice-forward and platform-safe.",
  ].join("\n");

  return {
    summary,
    audioPlan,
    consensus,
  };
}

export async function startSoundRoomSession({
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
  const session = await prisma.soundDesignRoomSession.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      projectId: projectId || null,
      projectType,
      topic: topic || "Audio direction and mix review",
      status: "open",
      metadata: {
        source: "phase32_sound_design_room",
      },
    },
  });

  await runSoundRoomRound({
    sessionId: session.id,
  });

  return getSoundRoomSession(session.id);
}

export async function runSoundRoomRound({
  sessionId,
}: {
  sessionId: string;
}) {
  const session = await prisma.soundDesignRoomSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      rounds: {
        orderBy: { index: "desc" },
        take: 1,
      },
    },
  });

  let snapshot: any = {
    project: {
      id: session.projectId,
      title: session.topic,
      status: "unattached",
    },
    narrationText: "",
    voiceAssets: [],
    musicAssets: [],
    sfxAssets: [],
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

    if (podcast) {
      snapshot = normalizePodcastAudioSnapshot(podcast);
    }
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

    if (video) {
      snapshot = normalizeVideoAudioSnapshot(video);
    }
  }

  const index = session.rounds[0] ? session.rounds[0].index + 1 : 0;

  const round = await prisma.soundDesignRoomRound.create({
    data: {
      sessionId,
      index,
      audioJson: snapshot,
    },
  });

  const evaluations = {
    voice: evaluateSoundAgent("voice", snapshot),
    music: evaluateSoundAgent("music", snapshot),
    sfx: evaluateSoundAgent("sfx", snapshot),
    mix: evaluateSoundAgent("mix", snapshot),
  };

  await prisma.soundDesignRoomMessage.createMany({
    data: Object.entries(evaluations).map(([agentType, evaluation]) => ({
      roundId: round.id,
      role: "agent",
      agentType,
      content: safeJson(evaluation),
      parsedJson: evaluation,
    })),
  });

  const coordinator = synthesizeAudioPlan({
    evaluations,
    snapshot,
  });

  await prisma.soundDesignRoomMessage.create({
    data: {
      roundId: round.id,
      role: "coordinator",
      agentType: "coordinator",
      content: coordinator.summary,
      parsedJson: coordinator,
    },
  });

  const updatedRound = await prisma.soundDesignRoomRound.update({
    where: { id: round.id },
    data: {
      summary: coordinator.summary,
      audioPlanJson: coordinator.audioPlan,
      consensus: coordinator.consensus,
    },
  });

  if (coordinator.consensus) {
    await prisma.soundDesignRoomSession.update({
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

export async function applySoundRoomPlan({
  sessionId,
}: {
  sessionId: string;
}) {
  const session = await prisma.soundDesignRoomSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      rounds: {
        orderBy: { index: "desc" },
        take: 1,
      },
    },
  });

  const latestRound = session.rounds[0];

  if (!latestRound?.audioPlanJson) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "No audio plan exists to apply.",
    };
  }

  await prisma.soundDesignRoomSession.update({
    where: { id: session.id },
    data: {
      status: "applied",
      metadata: {
        ...(session.metadata as any || {}),
        appliedRoundId: latestRound.id,
        appliedAt: new Date().toISOString(),
      },
    },
  });

  return {
    ok: true,
    status: "APPLIED",
    projectId: session.projectId,
    projectType: session.projectType,
    audioPlan: latestRound.audioPlanJson,
  };
}

export async function getSoundRoomSession(sessionId: string) {
  return prisma.soundDesignRoomSession.findUnique({
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

export async function listSoundRoomSessions(companyId: string) {
  const sessions = await prisma.soundDesignRoomSession.findMany({
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
      applied: sessions.filter((s) => s.status === "applied").length,
      video: sessions.filter((s) => s.projectType === "video").length,
      podcast: sessions.filter((s) => s.projectType === "podcast").length,
    },
  };
}
