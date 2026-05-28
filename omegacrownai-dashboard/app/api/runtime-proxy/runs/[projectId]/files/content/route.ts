import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RUNTIME_ROOT = path.join(process.cwd(), "services", "sovereign-runtime");

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const url = new URL(req.url);
  const file = url.searchParams.get("file");

  if (!file || file.includes("..")) {
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

  if (!target.startsWith(artifactDir) || !fs.existsSync(target)) {
    return NextResponse.json(
      { ok: false, error: "File not found", projectId, file },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    projectId,
    file,
    content: fs.readFileSync(target, "utf8"),
  });
}
