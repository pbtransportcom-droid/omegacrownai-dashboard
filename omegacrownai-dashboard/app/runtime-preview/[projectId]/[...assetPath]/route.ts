import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8"
};

type RuntimeAssetRouteContext = {
  params: Promise<{
    projectId: string;
    assetPath: string[];
  }>;
};

export async function GET(_request: Request, context: RuntimeAssetRouteContext) {
  const params = await context.params;
  const safeProjectId = params.projectId.replace(/[^a-zA-Z0-9_-]/g, "");
  const assetPath = params.assetPath.join("/");

  if (!safeProjectId || assetPath.includes("..") || path.isAbsolute(assetPath)) {
    return new Response("Invalid artifact asset path", { status: 400 });
  }

  const artifactRoot = path.join(
    process.cwd(),
    "services",
    "sovereign-runtime",
    "data",
    "artifacts",
    safeProjectId
  );

  const filePath = path.join(artifactRoot, assetPath);

  if (!filePath.startsWith(artifactRoot)) {
    return new Response("Invalid artifact asset path", { status: 400 });
  }

  try {
    const data = await fs.readFile(filePath);
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";

    return new Response(data, {
      headers: {
        "content-type": contentType,
        "cache-control": "no-store"
      }
    });
  } catch {
    return new Response("Artifact asset not found", { status: 404 });
  }
}
