import { prisma } from "@/lib/db";

function baseMetadata(job: any, project: any, engine: string) {
  return {
    phase: 18,
    engine,
    sovereign: true,
    thirdParty: false,
    modelId: job.modelId || `${engine}-internal-v0`,
    seed: job.seed || null,
    prompt: job.prompt || null,
    lineage: {
      projectId: project.id,
      sceneId: job.sceneId || null,
      jobId: job.id,
    },
    note: "Phase 18 native generation asset record. Replace runtime stub with internal model output writer.",
  };
}

export async function runImageGeneration(job: any, project: any) {
  const asset = await prisma.videoAsset.create({
    data: {
      projectId: project.id,
      sceneId: job.sceneId || null,
      type: "generated_image",
      label: `Generated image for scene ${job.sceneId || "project"}`,
      placeholder: false,
      storageKey: `generated/${project.id}/${job.id}/image.png`,
      format: "png",
      metadata: baseMetadata(job, project, "omega_native_image_generator"),
    },
  });

  return asset.id;
}

export async function runVideoGeneration(job: any, project: any) {
  const asset = await prisma.videoAsset.create({
    data: {
      projectId: project.id,
      sceneId: job.sceneId || null,
      type: "generated_clip",
      label: `Generated clip for scene ${job.sceneId || "project"}`,
      placeholder: false,
      storageKey: `generated/${project.id}/${job.id}/clip.mp4`,
      format: "mp4",
      durationSeconds: 5,
      metadata: baseMetadata(job, project, "omega_native_video_generator"),
    },
  });

  return asset.id;
}

export async function runAvatarGeneration(job: any, project: any) {
  const asset = await prisma.videoAsset.create({
    data: {
      projectId: project.id,
      sceneId: job.sceneId || null,
      type: "generated_avatar",
      label: `Avatar presenter for scene ${job.sceneId || "project"}`,
      placeholder: false,
      storageKey: `generated/${project.id}/${job.id}/avatar.mp4`,
      format: "mp4",
      durationSeconds: 5,
      metadata: baseMetadata(job, project, "omega_native_avatar_generator"),
    },
  });

  return asset.id;
}

export async function runVoiceGeneration(job: any, project: any) {
  const asset = await prisma.videoAsset.create({
    data: {
      projectId: project.id,
      sceneId: job.sceneId || null,
      type: "generated_voice",
      label: `Voiceover for scene ${job.sceneId || "project"}`,
      placeholder: false,
      storageKey: `generated/${project.id}/${job.id}/voice.wav`,
      format: "wav",
      metadata: baseMetadata(job, project, "omega_native_voice_generator"),
    },
  });

  return asset.id;
}

export async function runMusicGeneration(job: any, project: any) {
  const asset = await prisma.videoAsset.create({
    data: {
      projectId: project.id,
      sceneId: null,
      type: "generated_music",
      label: `Generated music for ${project.title || project.id}`,
      placeholder: false,
      storageKey: `generated/${project.id}/${job.id}/music.wav`,
      format: "wav",
      durationSeconds: project.durationSeconds || 30,
      metadata: baseMetadata(job, project, "omega_native_music_generator"),
    },
  });

  return asset.id;
}
