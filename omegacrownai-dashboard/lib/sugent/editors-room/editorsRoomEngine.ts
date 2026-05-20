import { prisma } from "@/lib/db";
import { rebuildTimelineJson } from "@/lib/sugent/video/timelineEngine";

type EditorAgentType = "rhythm" | "visual" | "narrative" | "accessibility";

function safeJson(obj: any) {
  return JSON.stringify(obj, null, 2);
}

function normalizeTimelineSnapshot(project: any) {
  const timeline = project.timeline;

  return {
    project: {
      id: project.id,
      title: project.title,
      durationSeconds: project.durationSeconds,
      aspectRatio: project.aspectRatio,
      status: project.status,
    },
    timeline: timeline
      ? {
          id: timeline.id,
          fps: timeline.fps,
          durationSeconds: timeline.durationSeconds,
          structureJson: timeline.structureJson,
          tracks: timeline.tracks || [],
        }
      : null,
    scenes: project.scenes || [],
    assets: project.assets || [],
  };
}

function evaluateTimelineAgent(agentType: EditorAgentType, snapshot: any) {
  const scenes = snapshot.scenes || [];
  const timeline = snapshot.timeline;
  const duration = Number(snapshot.project?.durationSeconds || timeline?.durationSeconds || 0);

  if (agentType === "rhythm") {
    const issues = [];

    if (!timeline) {
      issues.push({
        type: "MISSING_TIMELINE",
        severity: "HIGH",
        description: "No timeline exists for pacing analysis.",
        proposed_fix: "Create or rebuild the normalized timeline before editing.",
      });
    }

    if (duration > 90) {
      issues.push({
        type: "PACING",
        severity: "MEDIUM",
        description: "Video may be too long for a concise marketing hero asset.",
        proposed_fix: "Tighten scene durations and remove redundant sections.",
      });
    }

    if (scenes.length > 0 && duration > 0) {
      const avg = duration / scenes.length;
      if (avg > 12) {
        issues.push({
          type: "PACING",
          severity: "MEDIUM",
          description: "Average scene duration may feel slow.",
          proposed_fix: "Trim scenes toward 6-10 seconds where possible.",
        });
      }
    }

    return {
      position: issues.length ? "Pacing needs improvement." : "Rhythm is acceptable for baseline review.",
      issues,
      global_notes: [
        "Keep opening movement fast and clear.",
        "Avoid long static sections before the core benefit is shown.",
      ],
    };
  }

  if (agentType === "visual") {
    const hasAssets = (snapshot.assets || []).length > 0;

    return {
      position: hasAssets ? "Visual structure has usable assets." : "Visual plan needs stronger asset coverage.",
      issues: hasAssets
        ? [
            {
              type: "VISUAL_POLISH",
              severity: "LOW",
              description: "Ensure transitions preserve premium cinematic continuity.",
              proposed_fix: "Use smooth transitions and consistent brand overlays.",
            },
          ]
        : [
            {
              type: "MISSING_ASSETS",
              severity: "HIGH",
              description: "Timeline has limited visual assets for scene coverage.",
              proposed_fix: "Generate or assign assets for each major scene.",
            },
          ],
      global_notes: [
        "Use premium command-center visuals, clean overlays, and consistent OmegaCrownAI branding.",
      ],
    };
  }

  if (agentType === "narrative") {
    const weakScenes = scenes.filter((scene: any) => {
      const text = `${scene.title || ""} ${scene.scriptSegment || ""} ${scene.voiceoverText || ""}`;
      return text.trim().length < 40;
    });

    return {
      position: weakScenes.length ? "Narrative clarity needs strengthening." : "Narrative flow is coherent enough for baseline review.",
      issues: weakScenes.map((scene: any) => ({
        type: "NARRATIVE_CLARITY",
        sceneId: scene.id,
        severity: "MEDIUM",
        description: "Scene has weak or thin story detail.",
        proposed_fix: "Add clearer setup, benefit, or transition language.",
      })),
      global_notes: [
        "Open with the problem, show the autonomous company system, then close with the CTA.",
      ],
    };
  }

  const accessibilityIssues = [];

  if (scenes.length > 0) {
    for (const scene of scenes) {
      const voice = String(scene.voiceoverText || scene.scriptSegment || "");
      if (voice.length > 260) {
        accessibilityIssues.push({
          type: "COMPREHENSION",
          sceneId: scene.id,
          severity: "MEDIUM",
          description: "Scene voiceover may be too dense for quick comprehension.",
          proposed_fix: "Shorten the narration and split long ideas across scenes.",
        });
      }
    }
  }

  return {
    position: accessibilityIssues.length ? "Comprehension needs refinement." : "Accessibility baseline is acceptable.",
    issues: accessibilityIssues,
    global_notes: [
      "Keep voiceover speakable.",
      "Keep captions short and readable.",
      "Prioritize clarity over visual complexity.",
    ],
  };
}

function synthesizeEditPlan({
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

  const editPlan = allIssues.map((issue: any, index: number) => ({
    id: `edit-${index + 1}`,
    action:
      issue.type === "PACING"
        ? "ADJUST_TIMING"
        : issue.type === "MISSING_ASSETS"
          ? "ADD_ASSET_COVERAGE"
          : issue.type === "NARRATIVE_CLARITY"
            ? "REWRITE_SCENE_BEAT"
            : issue.type === "COMPREHENSION"
              ? "SHORTEN_VOICEOVER"
              : "REVIEW_POLISH",
    targetId: issue.sceneId || issue.clipId || snapshot.timeline?.id || snapshot.project?.id,
    severity: issue.severity || "LOW",
    description: issue.description,
    proposedFix: issue.proposed_fix,
  }));

  const highIssues = allIssues.filter((issue: any) => issue.severity === "HIGH");
  const consensus = highIssues.length === 0;

  const summary = [
    consensus ? "Editor consensus reached. No high-severity blockers remain." : "Editor consensus not reached. High-severity issues must be resolved.",
    "",
    `Total issues: ${allIssues.length}`,
    `High-severity issues: ${highIssues.length}`,
    "",
    "Coordinator priorities:",
    "- Accessibility and comprehension override style.",
    "- Narrative clarity overrides pure pacing.",
    "- Rhythm and visual polish are applied when they do not reduce clarity.",
  ].join("\n");

  return {
    summary,
    editPlan,
    consensus,
  };
}

export async function startEditorsRoomSession({
  companyId,
  workspaceId,
  projectId,
  topic,
}: {
  companyId: string;
  workspaceId?: string | null;
  projectId: string;
  topic?: string | null;
}) {
  const project = await prisma.videoProject.findFirstOrThrow({
    where: {
      id: projectId,
      companyId,
    },
    include: {
      scenes: {
        orderBy: { index: "asc" },
      },
      assets: true,
      timeline: {
        include: {
          tracks: {
            orderBy: { index: "asc" },
            include: {
              clips: {
                orderBy: { startTimeSeconds: "asc" },
                include: {
                  asset: true,
                  scene: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const session = await prisma.editorsRoomSession.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      projectId,
      timelineId: project.timeline?.id || null,
      topic: topic || "Timeline pacing and edit review",
      status: "open",
      metadata: {
        source: "phase30_editors_room",
      },
    },
  });

  await runEditorsRoomRound({
    sessionId: session.id,
  });

  return getEditorsRoomSession(session.id);
}

export async function runEditorsRoomRound({
  sessionId,
}: {
  sessionId: string;
}) {
  const session = await prisma.editorsRoomSession.findUnique({
    where: { id: sessionId },
    include: {
      rounds: {
        orderBy: { index: "desc" },
        take: 1,
      },
    },
  });

if (!session) {
  return {
    ok: false,
    success: false,
    reason: "EDITORS_ROOM_SESSION_NOT_FOUND",
  };
}
  const project = await prisma.videoProject.findFirstOrThrow({
    where: {
      id: session.projectId,
      companyId: session.companyId,
    },
    include: {
      scenes: {
        orderBy: { index: "asc" },
      },
      assets: true,
      timeline: {
        include: {
          tracks: {
            orderBy: { index: "asc" },
            include: {
              clips: {
                orderBy: { startTimeSeconds: "asc" },
                include: {
                  asset: true,
                  scene: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const snapshot = normalizeTimelineSnapshot(project);
  const index = session.rounds[0] ? session.rounds[0].index + 1 : 0;

  const round = await prisma.editorsRoomRound.create({
    data: {
      sessionId,
      index,
      timelineJson: snapshot,
    },
  });

  const evaluations = {
    rhythm: evaluateTimelineAgent("rhythm", snapshot),
    visual: evaluateTimelineAgent("visual", snapshot),
    narrative: evaluateTimelineAgent("narrative", snapshot),
    accessibility: evaluateTimelineAgent("accessibility", snapshot),
  };

  await prisma.editorsRoomMessage.createMany({
    data: Object.entries(evaluations).map(([agentType, evaluation]) => ({
      roundId: round.id,
      role: "agent",
      agentType,
      content: safeJson(evaluation),
      parsedJson: evaluation,
    })),
  });

  const coordinator = synthesizeEditPlan({
    evaluations,
    snapshot,
  });

  await prisma.editorsRoomMessage.create({
    data: {
      roundId: round.id,
      role: "coordinator",
      agentType: "coordinator",
      content: coordinator.summary,
      parsedJson: coordinator,
    },
  });

  const updatedRound = await prisma.editorsRoomRound.update({
    where: { id: round.id },
    data: {
      summary: coordinator.summary,
      editPlanJson: coordinator.editPlan,
      consensus: coordinator.consensus,
    },
  });

  if (coordinator.consensus) {
    await prisma.editorsRoomSession.update({
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

export async function applyEditorsRoomPlan({
  sessionId,
}: {
  sessionId: string;
}) {
  const session = await prisma.editorsRoomSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      rounds: {
        orderBy: { index: "desc" },
        take: 1,
      },
    },
  });

  if (!session.timelineId) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "No timeline exists for this Editor's Room session.",
    };
  }

  const latestRound = session.rounds[0];

  if (!latestRound?.editPlanJson) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "No edit plan exists to apply.",
    };
  }

  const rebuilt = await rebuildTimelineJson(session.timelineId);

  await prisma.editorsRoomSession.update({
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
    timelineId: session.timelineId,
    editPlan: latestRound.editPlanJson,
    rebuilt,
  };
}

export async function getEditorsRoomSession(sessionId: string) {
  return prisma.editorsRoomSession.findUnique({
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

export async function listEditorsRoomSessions(companyId: string) {
  const sessions = await prisma.editorsRoomSession.findMany({
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
    },
  };
}
