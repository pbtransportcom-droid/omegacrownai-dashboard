import fs from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { prisma } from "@/lib/db";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";
import { evaluateRuntimePolicy } from "@/lib/sugent/runtime-policy/runtimePolicyEngine";
import { createCreatorRenderJob, updateCreatorRenderJob } from "@/lib/sugent/creator-render/renderJobEngine";

const execFileAsync = promisify(execFile);

const EXPORT_ROOT = path.join(process.cwd(), "public", "exports");

async function ensureExportDir(companyId: string) {
  const dir = path.join(EXPORT_ROOT, companyId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

function safeFilePart(value: string) {
  return String(value || "export")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "export";
}

async function getProjectInfo(projectId: string, projectType: string) {
  if (projectType === "podcast") {
    const podcast = await prisma.podcastProject.findUnique({ where: { id: projectId } });
    return {
      title: podcast?.title || "Untitled Podcast",
      description: podcast?.description || "",
      source: podcast,
    };
  }

  const video = await prisma.videoProject.findUnique({
    where: { id: projectId },
    include: {
      scenes: {
        orderBy: { index: "asc" },
      },
    },
  });

  return {
    title: video?.title || "Untitled Video",
    description: video?.description || "",
    source: video,
  };
}

function buildVideoManifest(projectInfo: any) {
  const video = projectInfo.source;
  const scenes = Array.isArray(video?.scenes) ? video.scenes : [];

  return {
    kind: "omegacrownai_video_export",
    title: projectInfo.title,
    description: projectInfo.description,
    durationSeconds: video?.durationSeconds || Math.max(scenes.length * 6, 30),
    aspectRatio: video?.aspectRatio || "16:9",
    scenes: scenes.map((scene: any, index: number) => ({
      index,
      title: scene.title || `Scene ${index + 1}`,
      voiceoverText: scene.voiceoverText || scene.scriptSegment || "",
      visualPrompt: scene.visualPrompt || scene.prompt || "",
      durationSeconds: scene.durationSeconds || 6,
    })),
    productionNotes: {
      output: "Placeholder MP4 manifest for native creator export pipeline.",
      nextStep: "Connect this manifest to actual ffmpeg/media renderer.",
    },
  };
}

function buildPodcastManifest(projectInfo: any) {
  const podcast = projectInfo.source;

  return {
    kind: "omegacrownai_podcast_export",
    title: projectInfo.title,
    description: projectInfo.description,
    durationSeconds: podcast?.durationSeconds || 180,
    audioPlan: {
      voice: podcast?.voice || "default",
      music: podcast?.musicStyle || "cinematic",
      format: "mp3",
    },
    productionNotes: {
      output: "Placeholder audio manifest for native creator export pipeline.",
      nextStep: "Connect this manifest to actual TTS/audio renderer.",
    },
  };
}

async function writePlaceholderExport({
  companyId,
  title,
  projectType,
  format,
  manifest,
}: {
  companyId: string;
  title: string;
  projectType: string;
  format: string;
  manifest: any;
}) {
  const dir = await ensureExportDir(companyId);
  const timestamp = Date.now();
  const base = `${safeFilePart(title)}-${projectType}-${timestamp}`;
  const fileName = `${base}.${format === "mp3" ? "json" : "json"}`;
  const filePath = path.join(dir, fileName);

  await fs.writeFile(filePath, JSON.stringify(manifest, null, 2), "utf-8");

  const stats = await fs.stat(filePath);

  return {
    fileName,
    filePath,
    publicUrl: `/exports/${companyId}/${fileName}`,
    sizeBytes: stats.size,
  };
}


async function renderRealVideoExport({
  companyId,
  title,
  manifest,
}: {
  companyId: string;
  title: string;
  manifest: any;
}) {
  const dir = await ensureExportDir(companyId);
  const timestamp = Date.now();
  const base = `${safeFilePart(title)}-video-${timestamp}`;
  const manifestFileName = `${base}.json`;
  const mp4FileName = `${base}.mp4`;
  const workDir = path.join(dir, `${base}-work`);
  const manifestPath = path.join(dir, manifestFileName);
  const outputPath = path.join(dir, mp4FileName);

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  const scriptPath = path.join(process.cwd(), "scripts", "creator-render", "render_video_from_manifest.py");

  const { stdout } = await execFileAsync("python3", [
    scriptPath,
    manifestPath,
    workDir,
    outputPath,
  ], {
    maxBuffer: 1024 * 1024 * 10,
  });

  const parsed = JSON.parse(String(stdout || "{}").trim());
  const stats = await fs.stat(outputPath);

  return {
    fileName: mp4FileName,
    filePath: outputPath,
    publicUrl: `/exports/${companyId}/${mp4FileName}`,
    sizeBytes: stats.size,
    durationSeconds: parsed.durationSeconds || manifest.durationSeconds || null,
    manifestFileName,
    manifestPublicUrl: `/exports/${companyId}/${manifestFileName}`,
    renderer: "ffmpeg_scene_card_tts_audio_renderer",
    sceneCount: parsed.sceneCount || manifest.scenes?.length || 0,
    audio: parsed.audio || null,
  };
}


async function renderRealPodcastExport({
  companyId,
  title,
  manifest,
}: {
  companyId: string;
  title: string;
  manifest: any;
}) {
  const dir = await ensureExportDir(companyId);
  const timestamp = Date.now();
  const base = `${safeFilePart(title)}-podcast-${timestamp}`;
  const manifestFileName = `${base}.json`;
  const mp3FileName = `${base}.mp3`;
  const workDir = path.join(dir, `${base}-work`);
  const manifestPath = path.join(dir, manifestFileName);
  const outputPath = path.join(dir, mp3FileName);

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  const scriptPath = path.join(process.cwd(), "scripts", "creator-render", "render_podcast_from_manifest.py");

  const { stdout } = await execFileAsync("python3", [
    scriptPath,
    manifestPath,
    workDir,
    outputPath,
  ], {
    maxBuffer: 1024 * 1024 * 10,
  });

  const parsed = JSON.parse(String(stdout || "{}").trim());
  const stats = await fs.stat(outputPath);

  return {
    fileName: mp3FileName,
    filePath: outputPath,
    publicUrl: `/exports/${companyId}/${mp3FileName}`,
    sizeBytes: stats.size,
    durationSeconds: parsed.durationSeconds || manifest.durationSeconds || null,
    manifestFileName,
    manifestPublicUrl: `/exports/${companyId}/${manifestFileName}`,
    renderer: "ffmpeg_podcast_tts_mp3_renderer",
    segmentCount: parsed.segmentCount || 0,
    audio: parsed.audio || null,
  };
}

export async function executeCreatorExport({
  companyId,
  workspaceId,
  projectId,
  projectType = "video",
  actorId = "system-owner",
  actorType = "system",
  format,
}: {
  companyId: string;
  workspaceId?: string | null;
  projectId: string;
  projectType?: string;
  actorId?: string | null;
  actorType?: string;
  format?: string;
}) {
  const action = projectType === "podcast" ? "render_audio" : "render";

  const policy = await evaluateRuntimePolicy({
    companyId,
    workspaceId: workspaceId || null,
    projectId,
    projectType,
    actorId: "system-owner",
    actorType: "system",
    resource: "runtime",
    action: projectType === "podcast" ? "render" : "render",
    metadata: {
      source: "creator_export",
      originalActorId: actorId,
      requestedAction: action,
    },
  });

  if (!policy.ok) {
    const blocked = await prisma.creatorExportAsset.create({
      data: {
        companyId,
        workspaceId: workspaceId || null,
        projectId,
        projectType,
        assetType: projectType === "podcast" ? "audio" : "video",
        format: format || (projectType === "podcast" ? "mp3" : "mp4"),
        status: "blocked",
        policyDecisionId: policy.decision?.id || null,
        error: policy.reason,
        createdBy: actorId || "system-owner",
        startedAt: new Date(),
        completedAt: new Date(),
        metadata: {
          failedChecks: policy.failedChecks || [],
          policyStatus: policy.status,
        },
      },
    });

    await prisma.creatorExportEvent.create({
      data: {
        exportId: blocked.id,
        companyId,
        projectId,
        projectType,
        type: "EXPORT_BLOCKED",
        status: "blocked",
        message: policy.reason,
        metadata: {
          failedChecks: policy.failedChecks || [],
        },
      },
    });

    await recordAuditEvent({
      companyId,
      workspaceId: workspaceId || null,
      projectId,
      actorId: actorId || "system-owner",
      actorType,
      action: "CREATOR_EXPORT_BLOCKED",
      entityType: "CreatorExportAsset",
      entityId: blocked.id,
      severity: "warning",
      metadata: {
        projectId,
        projectType,
        reason: policy.reason,
        failedChecks: policy.failedChecks || [],
      },
    });

    return {
      ok: false,
      status: "BLOCKED",
      reason: policy.reason,
      export: blocked,
      policy,
    };
  }

  const assetFormat = format || (projectType === "podcast" ? "mp3" : "mp4");

  const renderJob = await createCreatorRenderJob({
    companyId,
    workspaceId: workspaceId || null,
    projectId,
    projectType,
    format: assetFormat,
    renderer: projectType === "podcast" ? "ffmpeg_podcast_mp3_renderer" : "ffmpeg_scene_card_audio_renderer",
    inputJson: {
      projectId,
      projectType,
      format: assetFormat,
      source: "creator_export",
    },
    createdBy: actorId || "system-owner",
    actorType,
  });

  await updateCreatorRenderJob({
    jobId: renderJob.id,
    status: "running",
    progress: 10,
    message: "Runtime policy allowed. Loading project data.",
  });

  const projectInfo = await getProjectInfo(projectId, projectType);
  const manifest = projectType === "podcast"
    ? buildPodcastManifest(projectInfo)
    : buildVideoManifest(projectInfo);

  const exportRecord = await prisma.creatorExportAsset.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      projectId,
      projectType,
      title: projectInfo.title,
      description: projectInfo.description,
      assetType: projectType === "podcast" ? "audio" : "video",
      format: assetFormat,
      status: "running",
      mimeType: projectType === "podcast" ? "audio/mpeg" : "video/mp4",
      durationSeconds: manifest.durationSeconds || null,
      renderJobId: renderJob.id,
      policyDecisionId: policy.decision?.id || null,
      qaScorecardId: policy.checks?.qa?.scorecardId || null,
      manifestJson: manifest,
      createdBy: actorId || "system-owner",
      startedAt: new Date(),
      metadata: {
        policyStatus: policy.status,
        checks: policy.checks,
      },
    },
  });

  await prisma.creatorExportEvent.create({
    data: {
      exportId: exportRecord.id,
      companyId,
      projectId,
      projectType,
      type: "EXPORT_STARTED",
      status: "running",
      message: "Creator export started after runtime policy allowed.",
      metadata: {
        format: assetFormat,
      },
    },
  });

  await updateCreatorRenderJob({
    jobId: renderJob.id,
    status: "running",
    progress: 35,
    message: "Manifest created. Starting media renderer.",
    metadata: {
      exportId: exportRecord.id,
    },
  });

  const written = projectType === "video"
    ? await renderRealVideoExport({
        companyId,
        title: projectInfo.title,
        manifest,
      })
    : projectType === "podcast"
      ? await renderRealPodcastExport({
          companyId,
          title: projectInfo.title,
          manifest,
        })
      : await writePlaceholderExport({
          companyId,
          title: projectInfo.title,
          projectType,
          format: assetFormat,
          manifest,
        });

  await updateCreatorRenderJob({
    jobId: renderJob.id,
    status: "running",
    progress: 80,
    message: "Media renderer completed. Saving export record.",
    metadata: {
      exportId: exportRecord.id,
      publicUrl: written.publicUrl,
      sizeBytes: written.sizeBytes,
    },
  });

  const completed = await prisma.creatorExportAsset.update({
    where: { id: exportRecord.id },
    data: {
      status: "completed",
      fileName: written.fileName,
      filePath: written.filePath,
      publicUrl: written.publicUrl,
      sizeBytes: written.sizeBytes,
      completedAt: new Date(),
      metadata: {
        policyStatus: policy.status,
        checks: policy.checks,
        outputType: projectType === "video" ? "mp4_video_with_audio" : projectType === "podcast" ? "mp3_podcast_audio" : "manifest_placeholder",
        renderer: projectType === "video" ? "ffmpeg_scene_card_tts_audio_renderer" : projectType === "podcast" ? "ffmpeg_podcast_tts_mp3_renderer" : "manifest_placeholder",
        audioRenderer: projectType === "video" ? "espeak_tts_voiceover_plus_music_bed" : projectType === "podcast" ? "podcast_espeak_tts_narration_music_bed" : null,
        audio: (written as any).audio || null,
        manifestPublicUrl: (written as any).manifestPublicUrl || null,
        nextRenderer: projectType === "podcast" ? "completed_podcast_tts_mp3_renderer" : "completed_ffmpeg_video_tts_audio_renderer",
      },
    },
  });

  await prisma.creatorExportEvent.create({
    data: {
      exportId: completed.id,
      companyId,
      projectId,
      projectType,
      type: "EXPORT_COMPLETED",
      status: "completed",
      message: projectType === "video"
        ? "Creator export completed with real MP4 video and AAC audio bed."
        : projectType === "podcast"
          ? "Creator export completed with real MP3 podcast audio."
          : "Creator export completed and file manifest was written.",
      metadata: {
        publicUrl: completed.publicUrl,
        fileName: completed.fileName,
        sizeBytes: completed.sizeBytes,
      },
    },
  });

  await updateCreatorRenderJob({
    jobId: renderJob.id,
    status: "completed",
    progress: 100,
    message: "Creator render job completed.",
    outputJson: {
      exportId: completed.id,
      publicUrl: completed.publicUrl,
      fileName: completed.fileName,
      sizeBytes: completed.sizeBytes,
      durationSeconds: completed.durationSeconds,
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    projectId,
    actorId: actorId || "system-owner",
    actorType,
    action: "CREATOR_EXPORT_COMPLETED",
    entityType: "CreatorExportAsset",
    entityId: completed.id,
    severity: "info",
    metadata: {
      exportId: completed.id,
      projectId,
      projectType,
      format: assetFormat,
      publicUrl: completed.publicUrl,
      policyDecisionId: policy.decision?.id || null,
      qaScorecardId: policy.checks?.qa?.scorecardId || null,
    },
  });

  return {
    ok: true,
    status: "COMPLETED",
    export: completed,
    policy,
  };
}

export async function getCreatorExportDashboard(companyId: string) {
  const exports = await prisma.creatorExportAsset.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    ok: true,
    companyId,
    exports,
    summary: {
      exports: exports.length,
      completed: exports.filter((item) => item.status === "completed").length,
      blocked: exports.filter((item) => item.status === "blocked").length,
      running: exports.filter((item) => item.status === "running").length,
      video: exports.filter((item) => item.projectType === "video").length,
      podcast: exports.filter((item) => item.projectType === "podcast").length,
    },
  };
}
