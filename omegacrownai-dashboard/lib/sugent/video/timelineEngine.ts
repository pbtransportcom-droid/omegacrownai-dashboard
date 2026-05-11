import { prisma } from "@/lib/db";

function sceneDuration(scene: any) {
  if (typeof scene.startTimeSeconds === "number" && typeof scene.endTimeSeconds === "number") {
    return Math.max(1, scene.endTimeSeconds - scene.startTimeSeconds);
  }

  return 6;
}

function clipToJson(clip: any) {
  return {
    clipId: clip.id,
    sceneId: clip.sceneId,
    assetId: clip.assetId,
    startTimeSeconds: clip.startTimeSeconds,
    durationSeconds: clip.durationSeconds,
    inPointSeconds: clip.inPointSeconds,
    outPointSeconds: clip.outPointSeconds,
    transitionIn: clip.transitionIn || "cut",
    transitionOut: clip.transitionOut || "cut",
    asset: clip.asset
      ? {
          id: clip.asset.id,
          type: clip.asset.type,
          storageKey: clip.asset.storageKey,
          format: clip.asset.format,
          placeholder: clip.asset.placeholder,
        }
      : null,
    metadata: clip.metadata || {},
  };
}

export async function createDefaultTimeline({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  const project = await prisma.videoProject.findFirstOrThrow({
    where: { id: projectId, companyId },
    include: {
      timeline: {
        include: {
          tracks: {
            include: { clips: true },
          },
        },
      },
      scenes: {
        orderBy: { index: "asc" },
        include: { assets: true },
      },
      assets: true,
    },
  });

  if (!project.timeline) {
    throw new Error("VIDEO_PROJECT_HAS_NO_TIMELINE");
  }

  if (project.timeline.tracks.length > 0) {
    return getTimeline({ companyId, projectId });
  }

  const videoTrack = await prisma.videoTrack.create({
    data: { timelineId: project.timeline.id, type: "video", index: 0, label: "Video" },
  });

  const audioTrack = await prisma.videoTrack.create({
    data: { timelineId: project.timeline.id, type: "audio", index: 1, label: "Voice + Audio" },
  });

  const overlayTrack = await prisma.videoTrack.create({
    data: { timelineId: project.timeline.id, type: "overlay", index: 2, label: "Brand Overlays" },
  });

  const subtitleTrack = await prisma.videoTrack.create({
    data: { timelineId: project.timeline.id, type: "subtitle", index: 3, label: "Subtitles" },
  });

  let cursor = 0;

  for (const scene of project.scenes) {
    const duration = sceneDuration(scene);

    const visualAsset =
      scene.assets.find((asset) => asset.type.includes("image")) ||
      scene.assets.find((asset) => asset.type.includes("clip")) ||
      scene.assets.find((asset) => asset.type.includes("visual")) ||
      scene.assets[0] ||
      null;

    const voiceAsset =
      scene.assets.find((asset) => asset.type.includes("voice")) ||
      scene.assets.find((asset) => asset.type.includes("audio")) ||
      null;

    await prisma.videoClip.create({
      data: {
        trackId: videoTrack.id,
        sceneId: scene.id,
        assetId: visualAsset?.id || null,
        startTimeSeconds: cursor,
        durationSeconds: duration,
        inPointSeconds: 0,
        outPointSeconds: duration,
        transitionIn: scene.index === 0 ? "fade" : "cut",
        transitionOut: "cut",
        metadata: { source: "default_timeline_initializer", sceneTitle: scene.title },
      },
    });

    await prisma.videoClip.create({
      data: {
        trackId: audioTrack.id,
        sceneId: scene.id,
        assetId: voiceAsset?.id || null,
        startTimeSeconds: cursor,
        durationSeconds: duration,
        inPointSeconds: 0,
        outPointSeconds: duration,
        transitionIn: "cut",
        transitionOut: "cut",
        metadata: { source: "default_timeline_initializer", voiceoverText: scene.voiceoverText },
      },
    });

    await prisma.videoClip.create({
      data: {
        trackId: subtitleTrack.id,
        sceneId: scene.id,
        assetId: null,
        startTimeSeconds: cursor,
        durationSeconds: duration,
        inPointSeconds: 0,
        outPointSeconds: duration,
        transitionIn: "cut",
        transitionOut: "cut",
        metadata: { text: scene.voiceoverText, source: "default_subtitle_track" },
      },
    });

    cursor += duration;
  }

  const overlayDuration = Math.max(cursor, project.durationSeconds || 0);

  await prisma.videoClip.create({
    data: {
      trackId: overlayTrack.id,
      assetId: null,
      sceneId: null,
      startTimeSeconds: 0,
      durationSeconds: overlayDuration,
      inPointSeconds: 0,
      outPointSeconds: overlayDuration,
      transitionIn: "fade",
      transitionOut: "fade",
      metadata: {
        type: "brand_overlay",
        brandOverlay: project.brandOverlay || {},
      },
    },
  });

  await rebuildTimelineJson(project.timeline.id);
  return getTimeline({ companyId, projectId });
}

export async function getTimeline({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  const project = await prisma.videoProject.findFirstOrThrow({
    where: { id: projectId, companyId },
    include: {
      timeline: {
        include: {
          tracks: {
            orderBy: { index: "asc" },
            include: {
              clips: {
                orderBy: { startTimeSeconds: "asc" },
                include: { asset: true, scene: true },
              },
            },
          },
        },
      },
    },
  });

  if (!project.timeline) {
    throw new Error("VIDEO_PROJECT_HAS_NO_TIMELINE");
  }

  return {
    ok: true,
    projectId,
    timeline: project.timeline,
    tracks: project.timeline.tracks,
  };
}

export async function addClip({
  companyId,
  projectId,
  trackId,
  assetId,
  sceneId,
  startTimeSeconds,
  durationSeconds,
}: {
  companyId: string;
  projectId: string;
  trackId: string;
  assetId?: string | null;
  sceneId?: string | null;
  startTimeSeconds: number;
  durationSeconds: number;
}) {
  const timeline = await assertTrackBelongsToProject({ companyId, projectId, trackId });

  const clip = await prisma.videoClip.create({
    data: {
      trackId,
      assetId: assetId || null,
      sceneId: sceneId || null,
      startTimeSeconds,
      durationSeconds,
      inPointSeconds: 0,
      outPointSeconds: durationSeconds,
      transitionIn: "cut",
      transitionOut: "cut",
      metadata: { source: "timeline_editor" },
    },
  });

  await rebuildTimelineJson(timeline.id);
  return clip;
}

export async function moveClip({
  companyId,
  projectId,
  clipId,
  newTrackId,
  newStartTimeSeconds,
}: {
  companyId: string;
  projectId: string;
  clipId: string;
  newTrackId?: string | null;
  newStartTimeSeconds: number;
}) {
  const clip = await getClipForProject({ companyId, projectId, clipId });
  const trackId = newTrackId || clip.trackId;
  const timeline = await assertTrackBelongsToProject({ companyId, projectId, trackId });

  const updated = await prisma.videoClip.update({
    where: { id: clipId },
    data: {
      trackId,
      startTimeSeconds: Math.max(0, newStartTimeSeconds),
    },
  });

  await rebuildTimelineJson(timeline.id);
  return updated;
}

export async function trimClip({
  companyId,
  projectId,
  clipId,
  newInPointSeconds,
  newOutPointSeconds,
}: {
  companyId: string;
  projectId: string;
  clipId: string;
  newInPointSeconds: number;
  newOutPointSeconds: number;
}) {
  const clip = await getClipForProject({ companyId, projectId, clipId });
  const timeline = clip.track.timeline;
  const duration = Math.max(1, newOutPointSeconds - newInPointSeconds);

  const updated = await prisma.videoClip.update({
    where: { id: clipId },
    data: {
      inPointSeconds: Math.max(0, newInPointSeconds),
      outPointSeconds: Math.max(newInPointSeconds + 1, newOutPointSeconds),
      durationSeconds: duration,
    },
  });

  await rebuildTimelineJson(timeline.id);
  return updated;
}

export async function setClipTransition({
  companyId,
  projectId,
  clipId,
  transitionIn,
  transitionOut,
}: {
  companyId: string;
  projectId: string;
  clipId: string;
  transitionIn?: string | null;
  transitionOut?: string | null;
}) {
  const clip = await getClipForProject({ companyId, projectId, clipId });
  const timeline = clip.track.timeline;

  const updated = await prisma.videoClip.update({
    where: { id: clipId },
    data: {
      transitionIn: transitionIn || clip.transitionIn,
      transitionOut: transitionOut || clip.transitionOut,
    },
  });

  await rebuildTimelineJson(timeline.id);
  return updated;
}

export async function deleteClip({
  companyId,
  projectId,
  clipId,
}: {
  companyId: string;
  projectId: string;
  clipId: string;
}) {
  const clip = await getClipForProject({ companyId, projectId, clipId });
  const timeline = clip.track.timeline;

  await prisma.videoClip.delete({ where: { id: clipId } });
  await rebuildTimelineJson(timeline.id);

  return { ok: true, deletedClipId: clipId };
}

export async function rebuildTimelineJson(timelineId: string) {
  const timeline = await prisma.videoTimeline.findUniqueOrThrow({
    where: { id: timelineId },
    include: {
      tracks: {
        orderBy: { index: "asc" },
        include: {
          clips: {
            orderBy: { startTimeSeconds: "asc" },
            include: { asset: true, scene: true },
          },
        },
      },
    },
  });

  const durationSeconds =
    timeline.tracks
      .flatMap((track) => track.clips)
      .reduce((max, clip) => Math.max(max, clip.startTimeSeconds + clip.durationSeconds), 0) ||
    timeline.durationSeconds ||
    0;

  const structureJson = {
    version: "phase19-normalized-timeline",
    fps: timeline.fps,
    durationSeconds,
    tracks: timeline.tracks.map((track) => ({
      id: track.id,
      type: track.type,
      index: track.index,
      label: track.label,
      clips: track.clips.map(clipToJson),
    })),
  };

  return prisma.videoTimeline.update({
    where: { id: timelineId },
    data: {
      structureJson,
      durationSeconds,
    },
  });
}

async function assertTrackBelongsToProject({
  companyId,
  projectId,
  trackId,
}: {
  companyId: string;
  projectId: string;
  trackId: string;
}) {
  const track = await prisma.videoTrack.findFirst({
    where: {
      id: trackId,
      timeline: { project: { id: projectId, companyId } },
    },
    include: { timeline: true },
  });

  if (!track) throw new Error("VIDEO_TRACK_NOT_FOUND");
  return track.timeline;
}

async function getClipForProject({
  companyId,
  projectId,
  clipId,
}: {
  companyId: string;
  projectId: string;
  clipId: string;
}) {
  const clip = await prisma.videoClip.findFirst({
    where: {
      id: clipId,
      track: {
        timeline: {
          project: { id: projectId, companyId },
        },
      },
    },
    include: {
      track: { include: { timeline: true } },
    },
  });

  if (!clip) throw new Error("VIDEO_CLIP_NOT_FOUND");
  return clip;
}
