import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

function readJson(filePath: string) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const root = process.cwd();

  const paths = {
    run: path.join(root, "data", "sovereign-runs", `${projectId}.json`),
    memory: path.join(root, "data", "runtime-memory", projectId, "shared-memory.json"),
    generated: path.join(root, "data", "generated-artifacts", projectId),
    build: path.join(root, "data", "project-builds", projectId),
    exportZip: path.join(root, "data", "exports", `${projectId}.zip`),
    podcast: path.join(root, "data", "podcast-packages", `${projectId}.json`),
    trading: path.join(root, "data", "trading-bots"),
    video: path.join(root, "data", "video-packages"),
  };

  const run = readJson(paths.run);
  const memory = readJson(paths.memory);

  const agents = memory?.agentHandoffs || run?.agents || [];
  const events = memory?.protocol?.timeline || run?.events || [];
  const artifacts = memory?.artifacts || run?.artifacts || [];

  const checks = [
    { label: "Run record", ok: fs.existsSync(paths.run), path: paths.run },
    { label: "Shared runtime memory", ok: fs.existsSync(paths.memory), path: paths.memory },
    { label: "Generated artifact folder", ok: fs.existsSync(paths.generated), path: paths.generated },
    { label: "Project build folder", ok: fs.existsSync(paths.build), path: paths.build },
    { label: "Export ZIP", ok: fs.existsSync(paths.exportZip), path: paths.exportZip },
    { label: "Podcast package", ok: fs.existsSync(paths.podcast), path: paths.podcast },
  ];

  const missing = checks.filter((check) => !check.ok);

  return NextResponse.json({
    ok: true,
    projectId,
    mode: memory?.mode || run?.mode || run?.intent || "unknown",
    status: run?.status || memory?.status || "unknown",
    counts: {
      agents: agents.length,
      events: Array.isArray(events) ? events.length : 0,
      artifacts: Array.isArray(artifacts) ? artifacts.length : 0,
      missing: missing.length,
    },
    checks,
    missing,
    agents,
    events,
    artifacts,
    validation: memory?.validation || null,
    delivery: memory?.delivery || null,
    run,
    memory,
  });
}
