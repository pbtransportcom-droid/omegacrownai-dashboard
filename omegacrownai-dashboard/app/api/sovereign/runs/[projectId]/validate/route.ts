import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

function firstExisting(candidates: string[]) {
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function checkPath(label: string, candidates: string[]) {
  const file = firstExisting(candidates);
  const exists = fs.existsSync(file);
  const stat = exists ? fs.statSync(file) : null;

  return {
    label,
    path: file,
    exists,
    size: stat ? stat.size : 0,
    ok: Boolean(stat && (stat.isDirectory() || stat.size > 0)),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const root = process.cwd();

  const results = [
    checkPath("Runtime metadata", [
      path.join(root, "services", "sovereign-runtime", "data", "artifacts", projectId, "metadata.json"),
      path.join(root, "data", "generated-artifacts", projectId, "metadata.json"),
    ]),
    checkPath("Runtime HTML preview", [
      path.join(root, "services", "sovereign-runtime", "data", "artifacts", projectId, "index.html"),
      path.join(root, "public", "runtime-deployments", projectId, "index.html"),
      path.join(root, "data", "generated-artifacts", projectId, "index.html"),
    ]),
    checkPath("Runtime stylesheet", [
      path.join(root, "services", "sovereign-runtime", "data", "artifacts", projectId, "styles.css"),
      path.join(root, "public", "runtime-deployments", projectId, "styles.css"),
      path.join(root, "data", "project-builds", projectId, "styles.css"),
    ]),
    checkPath("Delivery manifest", [
      path.join(root, "services", "sovereign-runtime", "data", "exports", `${projectId}.json`),
      path.join(root, "data", "exports", `${projectId}.json`),
    ]),
    checkPath("Deployment record", [
      path.join(root, "services", "sovereign-runtime", "data", "deployments", `${projectId}.json`),
    ]),
    checkPath("Artifact directory", [
      path.join(root, "services", "sovereign-runtime", "data", "artifacts", projectId),
    ]),
  ];

  const passed = results.filter((result) => result.ok).length;
  const failed = results.length - passed;

  return NextResponse.json({
    ok: failed === 0,
    projectId,
    passed,
    failed,
    results,
  });
}
