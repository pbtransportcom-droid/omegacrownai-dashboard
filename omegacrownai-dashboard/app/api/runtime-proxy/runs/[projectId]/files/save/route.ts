import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RUNTIME_ROOT = path.join(process.cwd(), "services", "sovereign-runtime");

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = await req.json();

  const file = String(body.file || "");
  const content = String(body.content || "");

  if (!file || file.includes("..") || path.isAbsolute(file)) {
    return NextResponse.json(
      { ok: false, error: "Invalid file path" },
      { status: 400 }
    );
  }

  const artifactDir = path.join(
    RUNTIME_ROOT,
    "data",
    "artifacts",
    projectId
  );

  const target = path.join(artifactDir, file);

  if (!target.startsWith(artifactDir)) {
    return NextResponse.json(
      { ok: false, error: "Invalid target path" },
      { status: 400 }
    );
  }

  if (!fs.existsSync(artifactDir)) {
    return NextResponse.json(
      { ok: false, error: "Artifact folder not found", projectId },
      { status: 404 }
    );
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);

  return NextResponse.json({
    ok: true,
    projectId,
    file,
    savedAt: new Date().toISOString(),
  });
}
