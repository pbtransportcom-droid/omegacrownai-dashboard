import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RUNTIME_ROOT = path.join(process.cwd(), "services", "sovereign-runtime");

function walk(dir: string, base = dir): any[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    const relative = path.relative(base, full);

    if (entry.isDirectory()) {
      return walk(full, base);
    }

    const stat = fs.statSync(full);

    return {
      name: entry.name,
      path: relative,
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
    };
  });
}

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

  return NextResponse.json({
    ok: true,
    projectId,
    files: walk(artifactDir),
  });
}
