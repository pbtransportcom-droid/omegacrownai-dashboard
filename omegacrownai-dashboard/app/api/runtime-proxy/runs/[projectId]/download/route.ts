import fs from "fs";
import path from "path";
import { Readable } from "stream";
import * as archiverModule from "archiver";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const archiver = (archiverModule as any).default || archiverModule;

const RUNTIME_ROOT = path.join(process.cwd(), "services", "sovereign-runtime");

function artifactDirFor(projectId: string) {
  return path.join(RUNTIME_ROOT, "data", "artifacts", projectId);
}

function zipHeaders(projectId: string) {
  return {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${projectId}-artifacts.zip"`,
  };
}

export async function HEAD(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const artifactDir = artifactDirFor(projectId);

  if (!fs.existsSync(artifactDir)) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: zipHeaders(projectId),
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const artifactDir = artifactDirFor(projectId);

  if (!fs.existsSync(artifactDir)) {
    return NextResponse.json(
      { ok: false, error: "Artifact folder not found", projectId },
      { status: 404 }
    );
  }

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.directory(artifactDir, false);
  archive.finalize();

  return new Response(Readable.toWeb(archive) as BodyInit, {
    status: 200,
    headers: zipHeaders(projectId),
  });
}
