import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();

    const version = String(body?.version || "").trim();
    if (!/^v\d+$/.test(version)) {
      return NextResponse.json(
        { ok: false, error: "Valid version required, example: v1." },
        { status: 400 }
      );
    }

    const artifactDir = path.join(process.cwd(), "data", "generated-artifacts", projectId);
    const versionPath = path.join(artifactDir, "versions", version, "index.html");
    const activePath = path.join(artifactDir, "index.html");
    const runPath = path.join(process.cwd(), "data", "sovereign-runs", `${projectId}.json`);

    if (!fs.existsSync(versionPath)) {
      return NextResponse.json({ ok: false, error: "Version not found." }, { status: 404 });
    }

    if (!fs.existsSync(runPath)) {
      return NextResponse.json({ ok: false, error: "Run not found." }, { status: 404 });
    }

    fs.copyFileSync(versionPath, activePath);

    const run = JSON.parse(fs.readFileSync(runPath, "utf8"));

    run.events = Array.isArray(run.events) ? run.events : [];
    run.artifacts = Array.isArray(run.artifacts) ? run.artifacts : [];

    run.activeVersion = version;
    run.status = "running";
    run.updatedAt = new Date().toISOString();

    run.events.push(`Rollback executed: ${version} promoted to active production artifact.`);

    run.artifacts.push({
      id: `${projectId}-rollback-${version}-${Date.now()}`,
      type: "rollback",
      title: `Rollback to ${version.toUpperCase()}`,
      status: "active",
      path: `data/generated-artifacts/${projectId}/index.html`,
    });

    fs.writeFileSync(runPath, JSON.stringify(run, null, 2));

    return NextResponse.json({
      ok: true,
      projectId,
      activeVersion: version,
      activePreview: `data/generated-artifacts/${projectId}/index.html`,
      eventCount: run.events.length,
      artifactCount: run.artifacts.length,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to rollback artifact." }, { status: 500 });
  }
}
