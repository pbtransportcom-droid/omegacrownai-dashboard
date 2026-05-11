import { prisma } from "@/lib/db";

export async function createRenderJob({
  companyId,
  projectId,
  type = "video",
}: {
  companyId: string;
  projectId: string;
  type?: "video" | "audio_only";
}) {
  const project = await prisma.videoProject.findFirstOrThrow({
    where: { id: projectId, companyId },
    include: { timeline: true, scenes: true, assets: true },
  });

  if (!project.timeline) {
    throw new Error("VIDEO_PROJECT_HAS_NO_TIMELINE");
  }

  return prisma.renderJob.create({
    data: {
      projectId: project.id,
      type,
      status: "queued",
      targetFormat: type === "audio_only" ? "wav" : "mp4",
      resolution: type === "audio_only" ? null : "1920x1080",
      fps: type === "audio_only" ? null : 30,
      bitrateKbps: type === "audio_only" ? null : 6000,
      logs: {
        createdBy: "native_render_orchestrator",
        phase: 17,
      },
    },
  });
}

export async function listRenderJobsForProject({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  return prisma.renderJob.findMany({
    where: {
      projectId,
      project: { companyId },
    },
    orderBy: { createdAt: "desc" },
    include: { outputAsset: true },
    take: 100,
  });
}

export async function getRenderJob({
  companyId,
  jobId,
}: {
  companyId: string;
  jobId: string;
}) {
  return prisma.renderJob.findFirst({
    where: {
      id: jobId,
      project: { companyId },
    },
    include: {
      outputAsset: true,
      project: true,
    },
  });
}

export async function processNextRenderJob() {
  const job = await prisma.renderJob.findFirst({
    where: { status: "queued" },
    orderBy: { createdAt: "asc" },
  });

  if (!job) {
    return {
      ok: true,
      processed: false,
      message: "No queued render job.",
    };
  }

  await prisma.renderJob.update({
    where: { id: job.id },
    data: {
      status: "running",
      startedAt: new Date(),
      logs: {
        phase: 17,
        worker: "native_render_worker",
        startedAt: new Date().toISOString(),
      },
    },
  });

  try {
    const project = await prisma.videoProject.findUniqueOrThrow({
      where: { id: job.projectId },
      include: {
        timeline: true,
        scenes: { orderBy: { index: "asc" } },
        assets: true,
      },
    });

    if (!project.timeline) {
      throw new Error("VIDEO_PROJECT_HAS_NO_TIMELINE");
    }

    const outputAsset =
      job.type === "audio_only"
        ? await createAudioOutputAsset(project, job)
        : await createVideoOutputAsset(project, job);

    const completed = await prisma.renderJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        outputAssetId: outputAsset.id,
        logs: {
          phase: 17,
          worker: "native_render_worker",
          completedAt: new Date().toISOString(),
          note:
            job.type === "audio_only"
              ? "Placeholder WAV render asset created. Real audio pipeline comes next."
              : "Placeholder MP4 render asset created. Real FFmpeg pipeline comes next.",
        },
      },
      include: { outputAsset: true },
    });

    return {
      ok: true,
      processed: true,
      job: completed,
    };
  } catch (error: any) {
    const failed = await prisma.renderJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        errorMessage: error?.message || "Unknown render error",
        logs: {
          phase: 17,
          worker: "native_render_worker",
          failedAt: new Date().toISOString(),
          error: error?.message || "Unknown render error",
        },
      },
    });

    return {
      ok: false,
      processed: true,
      job: failed,
      error: error?.message || "Unknown render error",
    };
  }
}

async function createAudioOutputAsset(project: any, job: any) {
  return prisma.videoAsset.create({
    data: {
      projectId: project.id,
      type: "rendered_audio",
      label: `master-${job.id}.wav`,
      placeholder: false,
      format: "wav",
      durationSeconds: project.durationSeconds || 0,
      storageKey: `renders/${project.id}/${job.id}/master.wav`,
      metadata: {
        phase: 17,
        renderer: "native_audio_engine_placeholder",
        targetFormat: "wav",
        note: "Phase 17 render record. Actual WAV binary pipeline will attach here.",
      },
    },
  });
}

async function createVideoOutputAsset(project: any, job: any) {
  return prisma.videoAsset.create({
    data: {
      projectId: project.id,
      type: "rendered_video",
      label: `final-${job.id}.mp4`,
      placeholder: false,
      format: "mp4",
      durationSeconds: project.durationSeconds || 0,
      storageKey: `renders/${project.id}/${job.id}/final.mp4`,
      metadata: {
        phase: 17,
        renderer: "native_video_compositor_placeholder",
        targetFormat: "mp4",
        resolution: job.resolution,
        fps: job.fps,
        bitrateKbps: job.bitrateKbps,
        note: "Phase 17 render record. Actual MP4 binary pipeline will attach here.",
      },
    },
  });
}
