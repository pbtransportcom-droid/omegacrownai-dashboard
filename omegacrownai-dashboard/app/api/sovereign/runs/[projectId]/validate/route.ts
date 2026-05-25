import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const root = process.cwd();

  const checks = [
    ["Run record", path.join(root, "data", "sovereign-runs", `${projectId}.json`)],
    ["Active artifact", path.join(root, "data", "generated-artifacts", projectId, "index.html")],
    ["Artifact metadata", path.join(root, "data", "generated-artifacts", projectId, "metadata.json")],
    ["Project build HTML", path.join(root, "data", "project-builds", projectId, "index.html")],
    ["Project build CSS", path.join(root, "data", "project-builds", projectId, "styles.css")],
    ["Export ZIP", path.join(root, "data", "exports", `${projectId}.zip`)],
  ];

  const results = checks.map(([label, filePath]) => ({
    label,
    path: filePath,
    exists: fs.existsSync(filePath),
    size: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0,
  }));

  const passed = results.filter((r) => r.exists).length;
  const failed = results.length - passed;

  return NextResponse.json({
    ok: failed === 0,
    projectId,
    passed,
    failed,
    results,
  });
}
