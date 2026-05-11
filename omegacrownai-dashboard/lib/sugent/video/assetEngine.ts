import { prisma } from "@/lib/db";
import {
  runAvatarGeneration,
  runImageGeneration,
  runMusicGeneration,
  runVideoGeneration,
  runVoiceGeneration,
} from "@/lib/sugent/video/assetRuntime";

export async function createAssetGenerationJobs({
  companyId,
  projectId,
  includeVideo = false,
  includeAvatar = false,
  includeMusic = true,
}: {
  companyId: string;
  projectId: string;
  includeVideo?: boolean;
  includeAvatar?: boolean;
  includeMusic?: boolean;
}) {
  const project = await prisma.videoProject.findFirstOrThrow({
    where: { id: projectId, companyId },
    include: {
      scenes: {
        orderBy: { index: "asc" },
        include: { assets: true },
      },
    },
  });

  const jobs = [];

  for (const scene of project.scenes) {
    const visualPlaceholder =
      scene.assets.find((asset) => asset.type.includes("visual") || asset.type.includes("placeholder")) ||
      scene.assets[0] ||
      null;

    jobs.push(
      prisma.assetGenerationJob.create({
        data: {
          projectId,
          sceneId: scene.id,
          assetId: visualPlaceholder?.id || null,
          type: "image",
          status: "queued",
          prompt: scene.scriptSegment,
          modelId: "omega-native-image-v0",
          logs: {
            source: "asset_generation_orchestrator",
            phase: 18,
          },
        },
      })
    );

    jobs.push(
      prisma.assetGenerationJob.create({
        data: {
          projectId,
          sceneId: scene.id,
          type: "voice",
          status: "queued",
          prompt: scene.voiceoverText,
          modelId: "omega-native-voice-v0",
          logs: {
            source: "asset_generation_orchestrator",
            phase: 18,
          },
        },
      })
    );

    if (includeVideo) {
      jobs.push(
        prisma.assetGenerationJob.create({
          data: {
            projectId,
            sceneId: scene.id,
            type: "video",
            status: "queued",
            prompt: `Create a short branded b-roll clip for: ${scene.scriptSegment}`,
            modelId: "omega-native-video-v0",
            logs: {
              source: "asset_generation_orchestrator",
              phase: 18,
            },
          },
        })
      );
    }

    if (includeAvatar) {
      jobs.push(
        prisma.assetGenerationJob.create({
          data: {
            projectId,
            sceneId: scene.id,
            type: "avatar",
            status: "queued",
            prompt: scene.voiceoverText,
            modelId: "omega-native-avatar-v0",
            logs: {
              source: "asset_generation_orchestrator",
              phase: 18,
            },
          },
        })
      );
    }
  }

  if (includeMusic) {
    jobs.push(
      prisma.assetGenerationJob.create({
        data: {
          projectId,
          sceneId: null,
          type: "music",
          status: "queued",
          prompt: `Premium cinematic background music for ${project.title}`,
          modelId: "omega-native-music-v0",
          logs: {
            source: "asset_generation_orchestrator",
            phase: 18,
          },
        },
      })
    );
  }

  return Promise.all(jobs);
}

export async function listAssetJobsForProject({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  return prisma.assetGenerationJob.findMany({
    where: {
      projectId,
      project: { companyId },
    },
    orderBy: { createdAt: "desc" },
    include: {
      scene: true,
      inputAsset: true,
      outputAsset: true,
    },
    take: 200,
  });
}

export async function getAssetJob({
  companyId,
  jobId,
}: {
  companyId: string;
  jobId: string;
}) {
  return prisma.assetGenerationJob.findFirst({
    where: {
      id: jobId,
      project: { companyId },
    },
    include: {
      project: true,
      scene: true,
      inputAsset: true,
      outputAsset: true,
    },
  });
}

export async function processNextAssetGenerationJob() {
  const job = await prisma.assetGenerationJob.findFirst({
    where: { status: "queued" },
    orderBy: { createdAt: "asc" },
  });

  if (!job) {
    return {
      ok: true,
      processed: false,
      message: "No queued asset generation job.",
    };
  }

  await prisma.assetGenerationJob.update({
    where: { id: job.id },
    data: {
      status: "running",
      startedAt: new Date(),
      logs: {
        phase: 18,
        worker: "native_asset_generation_worker",
        startedAt: new Date().toISOString(),
      },
    },
  });

  try {
    const project = await prisma.videoProject.findUniqueOrThrow({
      where: { id: job.projectId },
      include: {
        scenes: true,
        assets: true,
        timeline: true,
      },
    });

    let outputAssetId: string | null = null;

    if (job.type === "image") {
      outputAssetId = await runImageGeneration(job, project);
    } else if (job.type === "video") {
      outputAssetId = await runVideoGeneration(job, project);
    } else if (job.type === "avatar") {
      outputAssetId = await runAvatarGeneration(job, project);
    } else if (job.type === "voice") {
      outputAssetId = await runVoiceGeneration(job, project);
    } else if (job.type === "music") {
      outputAssetId = await runMusicGeneration(job, project);
    } else {
      throw new Error(`UNKNOWN_ASSET_GENERATION_TYPE_${job.type}`);
    }

    const completed = await prisma.assetGenerationJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        outputAssetId,
        logs: {
          phase: 18,
          worker: "native_asset_generation_worker",
          completedAt: new Date().toISOString(),
          outputAssetId,
        },
      },
      include: {
        outputAsset: true,
      },
    });

    await markProjectReadyIfGenerationComplete(project.id);

    return {
      ok: true,
      processed: true,
      job: completed,
    };
  } catch (error: any) {
    const failed = await prisma.assetGenerationJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        errorMessage: error?.message || "Unknown asset generation error",
        logs: {
          phase: 18,
          worker: "native_asset_generation_worker",
          failedAt: new Date().toISOString(),
          error: error?.message || "Unknown asset generation error",
        },
      },
    });

    return {
      ok: false,
      processed: true,
      job: failed,
      error: error?.message || "Unknown asset generation error",
    };
  }
}

async function markProjectReadyIfGenerationComplete(projectId: string) {
  const remaining = await prisma.assetGenerationJob.count({
    where: {
      projectId,
      status: {
        in: ["queued", "running"],
      },
    },
  });

  const completed = await prisma.assetGenerationJob.count({
    where: {
      projectId,
      status: "completed",
    },
  });

  if (remaining === 0 && completed > 0) {
    await prisma.videoProject.update({
      where: { id: projectId },
      data: {
        status: "ready_for_render",
      },
    });
  }
}
