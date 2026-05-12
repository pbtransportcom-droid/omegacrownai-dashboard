import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db";

const SUPPORTED_STORAGE_PROVIDERS = ["local", "s3", "gcs", "cloudflare_r2"];

function normalizeStorageProvider(provider?: string | null) {
  const value = String(provider || "local").toLowerCase();
  return SUPPORTED_STORAGE_PROVIDERS.includes(value) ? value : "local";
}

function extensionFor(fileName: string) {
  const ext = path.extname(fileName || "").replace(".", "").toLowerCase();
  return ext || null;
}

function mimeForExtension(extension?: string | null) {
  if (extension === "mp4") return "video/mp4";
  if (extension === "mp3") return "audio/mpeg";
  if (extension === "png") return "image/png";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "json") return "application/json";
  if (extension === "webp") return "image/webp";
  if (extension === "pdf") return "application/pdf";
  return "application/octet-stream";
}

function assetTypeForExtension(extension?: string | null) {
  if (extension === "mp4") return "video";
  if (extension === "mp3" || extension === "wav") return "audio";
  if (["png", "jpg", "jpeg", "webp"].includes(extension || "")) return "image";
  if (extension === "json") return "manifest";
  if (extension === "pdf") return "document";
  return "other";
}

function sha256File(filePath: string) {
  const hash = crypto.createHash("sha256");
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest("hex");
}

function publicUrlForLocalPath(localPath: string) {
  const normalized = localPath.replace(/\\/g, "/");
  const marker = "/public";
  const index = normalized.indexOf(marker);

  if (index >= 0) {
    return normalized.slice(index + marker.length);
  }

  if (normalized.startsWith("public/")) {
    return normalized.replace(/^public/, "");
  }

  return null;
}

function makeSignedPlaceholder(publicUrl?: string | null) {
  if (!publicUrl) return null;
  return `${publicUrl}?signed=placeholder&expires=${Date.now() + 60 * 60 * 1000}`;
}

function makeCdnPlaceholder(publicUrl?: string | null) {
  if (!publicUrl) return null;
  return `https://omegacrownai.com${publicUrl}`;
}

export function storageProviderRegistry() {
  return SUPPORTED_STORAGE_PROVIDERS.map((provider) => ({
    provider,
    status: provider === "local" ? "active" : "placeholder",
    signedUrls: true,
    cdnTracking: true,
    realAdapter: provider === "local",
    phase: "v4.6_phase67",
  }));
}

export async function registerCustomerStorageAsset({
  organizationId,
  companyId,
  workspaceId,
  assetType,
  fileName,
  localPath,
  publicUrl,
  storageProvider = "local",
  bucket,
  objectKey,
  mimeType,
  visibility = "public",
  metadata,
}: {
  organizationId: string;
  companyId?: string | null;
  workspaceId?: string | null;
  assetType?: string | null;
  fileName: string;
  localPath?: string | null;
  publicUrl?: string | null;
  storageProvider?: string | null;
  bucket?: string | null;
  objectKey?: string | null;
  mimeType?: string | null;
  visibility?: string | null;
  metadata?: any;
}) {
  const provider = normalizeStorageProvider(storageProvider);
  const extension = extensionFor(fileName);
  const resolvedType = assetType || assetTypeForExtension(extension);
  const resolvedMime = mimeType || mimeForExtension(extension);
  const exists = localPath ? fs.existsSync(localPath) : false;
  const sizeBytes = exists && localPath ? fs.statSync(localPath).size : 0;
  const checksum = exists && localPath ? sha256File(localPath) : null;
  const resolvedPublicUrl = publicUrl || (localPath ? publicUrlForLocalPath(localPath) : null);
  const signedUrl = makeSignedPlaceholder(resolvedPublicUrl);
  const cdnUrl = makeCdnPlaceholder(resolvedPublicUrl);

  const existing = checksum
    ? await prisma.customerStorageAsset.findFirst({
        where: {
          organizationId,
          checksum,
          fileName,
        },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const data = {
    companyId: companyId || null,
    workspaceId: workspaceId || null,
    assetType: resolvedType,
    mimeType: resolvedMime,
    fileName,
    extension,
    sizeBytes,
    storageProvider: provider,
    bucket: bucket || null,
    objectKey: objectKey || resolvedPublicUrl || fileName,
    localPath: localPath || null,
    publicUrl: resolvedPublicUrl,
    signedUrl,
    cdnUrl,
    checksum,
    status: exists || provider !== "local" ? "active" : "pending",
    visibility: visibility || "public",
    metadata: {
      ...(metadata || {}),
      source: "v4_phase67_storage_asset",
      exists,
      signedUrlPlaceholder: Boolean(signedUrl),
      cdnUrlPlaceholder: Boolean(cdnUrl),
    },
  };

  const asset = existing
    ? await prisma.customerStorageAsset.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.customerStorageAsset.create({
        data: {
          organizationId,
          ...data,
        },
      });

  const versionCount = await prisma.customerStorageAssetVersion.count({
    where: { assetId: asset.id },
  });

  const version = await prisma.customerStorageAssetVersion.create({
    data: {
      assetId: asset.id,
      version: versionCount + 1,
      storageProvider: provider,
      bucket: bucket || null,
      objectKey: data.objectKey,
      localPath: localPath || null,
      publicUrl: resolvedPublicUrl,
      signedUrl,
      cdnUrl,
      sizeBytes,
      checksum,
      status: asset.status,
      metadata: {
        source: "v4_phase67_storage_asset_version",
      },
    },
  });

  return {
    ok: true,
    asset,
    version,
  };
}

export async function syncCustomerExportsToStorage({
  organizationId,
  companyId,
  workspaceId,
  exportsDir = "public/exports",
}: {
  organizationId: string;
  companyId?: string | null;
  workspaceId?: string | null;
  exportsDir?: string;
}) {
  if (!fs.existsSync(exportsDir)) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Exports directory not found.",
      exportsDir,
    };
  }

  const files: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else {
        files.push(full);
      }
    }
  }

  walk(exportsDir);

  const allowed = new Set(["mp4", "mp3", "json", "png", "jpg", "jpeg", "webp"]);
  const results = [];

  for (const filePath of files) {
    const ext = extensionFor(filePath);
    if (!allowed.has(ext || "")) continue;

    const fileName = path.basename(filePath);

    const result = await registerCustomerStorageAsset({
      organizationId,
      companyId: companyId || null,
      workspaceId: workspaceId || null,
      fileName,
      localPath: filePath,
      storageProvider: "local",
      visibility: "public",
      metadata: {
        syncSource: "public_exports",
        originalPath: filePath,
      },
    });

    results.push(result.asset);
  }

  return {
    ok: true,
    synced: results.length,
    assets: results,
  };
}

export async function updateCustomerStorageAssetStatus({
  assetId,
  status,
  visibility,
}: {
  assetId: string;
  status?: string | null;
  visibility?: string | null;
}) {
  const existing = await prisma.customerStorageAsset.findUnique({
    where: { id: assetId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Storage asset not found.",
    };
  }

  const asset = await prisma.customerStorageAsset.update({
    where: { id: assetId },
    data: {
      status: status || existing.status,
      visibility: visibility || existing.visibility,
      metadata: {
        ...(existing.metadata as any || {}),
        lifecycleUpdatedAt: new Date().toISOString(),
      },
    },
  });

  return {
    ok: true,
    asset,
  };
}

export async function getCustomerStorageDashboard(organizationId: string) {
  const organization = await prisma.customerOrganization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Customer organization not found.",
    };
  }

  const assets = await prisma.customerStorageAsset.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const totalBytes = assets.reduce((sum, asset) => sum + asset.sizeBytes, 0);

  return {
    ok: true,
    organization,
    registry: storageProviderRegistry(),
    assets,
    summary: {
      assets: assets.length,
      active: assets.filter((asset) => asset.status === "active").length,
      archived: assets.filter((asset) => asset.status === "archived").length,
      deleted: assets.filter((asset) => asset.status === "deleted").length,
      publicAssets: assets.filter((asset) => asset.visibility === "public").length,
      signedAssets: assets.filter((asset) => asset.visibility === "signed").length,
      totalBytes,
      totalMb: Number((totalBytes / 1024 / 1024).toFixed(2)),
      byType: assets.reduce((acc: Record<string, number>, asset) => {
        acc[asset.assetType] = (acc[asset.assetType] || 0) + 1;
        return acc;
      }, {}),
      byProvider: assets.reduce((acc: Record<string, number>, asset) => {
        acc[asset.storageProvider] = (acc[asset.storageProvider] || 0) + 1;
        return acc;
      }, {}),
    },
  };
}
