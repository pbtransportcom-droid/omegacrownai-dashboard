import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";

const ROOT = "/var/www/omegacrownai-dashboard/omegacrownai-dashboard/public";
const PUBLIC_PREFIX = "/browser-artifacts";

export async function ensureBrowserArtifactDir(taskId: string) {
  const dir = path.join(ROOT, "browser-artifacts", taskId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveBrowserScreenshotArtifact({
  projectId,
  taskId,
  name = "screenshot",
  buffer,
  metadata = {},
}: {
  projectId?: string | null;
  taskId: string;
  name?: string;
  buffer: Buffer;
  metadata?: any;
}) {
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "screenshot";
  const filename = `${safeName}-${Date.now()}.png`;
  const dir = await ensureBrowserArtifactDir(taskId);
  const filePath = path.join(dir, filename);

  await fs.writeFile(filePath, buffer);

  const publicUrl = `${PUBLIC_PREFIX}/${taskId}/${filename}`;

  return prisma.browserArtifact.create({
    data: {
      taskId,
      projectId: projectId || null,
      kind: "screenshot",
      name: safeName,
      path: filePath,
      url: publicUrl,
      mimeType: "image/png",
      sizeBytes: buffer.length,
      metadata,
    },
  });
}
