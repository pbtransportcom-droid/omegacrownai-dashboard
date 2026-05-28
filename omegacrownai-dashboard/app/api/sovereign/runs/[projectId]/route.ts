import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const root = process.cwd();

  const runPath = path.join(root, "data", "sovereign-runs", `${projectId}.json`);
  const memoryPath = path.join(root, "data", "runtime-memory", projectId, "shared-memory.json");

  const run = fs.existsSync(runPath)
    ? JSON.parse(fs.readFileSync(runPath, "utf8"))
    : null;

  const memory = fs.existsSync(memoryPath)
    ? JSON.parse(fs.readFileSync(memoryPath, "utf8"))
    : null;

  if (!run && !memory) {
    return NextResponse.json(
      { ok: false, error: "Runtime not found.", projectId },
      { status: 404 }
    );
  }

  const source = memory || run || {};

  return NextResponse.json({
    ok: true,
    projectId,
    mode: source.mode || run?.mode || run?.intent || "general",
    status: run?.status || source.status || "running",
    agents: source.agentHandoffs || run?.agents || [],
    artifacts:
      source.artifacts ||
      source.run?.artifacts ||
      run?.artifacts ||
      [],
    events: source.protocol?.timeline || run?.events || [],
    transcript: source.protocol?.transcript || [],
    validation:
      source.validation ||
      source.run?.validation ||
      run?.validation ||
      null,
    delivery:
      source.delivery ||
      source.run?.delivery ||
      run?.delivery ||
      null,
    summary: source.protocol?.summary || run?.protocol?.summary || null,
    run,
    memory,
  });
}
