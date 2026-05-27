import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import archiver from "archiver";

const RUNTIME_ROOT = path.join(
  process.cwd(),
  "services",
  "sovereign-runtime"
);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const artifactDir = path.join(
    RUNTIME_ROOT,
    "data",
    "artifacts",
    projectId
  );

  if (!fs.existsSync(artifactDir)) {
    return NextResponse.json(
      { ok: false, error: "Artifact folder not found", projectId },
      { status: 404 }
    );
  }

  const chunks: Buffer[] = [];

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive.directory(artifactDir, false);

  const done = new Promise<Buffer>((resolve, reject) => {
    archive.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
  });

  await archive.finalize();

  const zip = await done;

  return new NextResponse(zip, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${projectId}-artifacts.zip"`,
    },
  });
}
