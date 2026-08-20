import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ROOT = process.cwd();
const RUNTIME_ROOT = path.join(ROOT, "services", "sovereign-runtime");

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export async function POST(
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

  const deployedDir = path.join(ROOT, "public", "runtime-deployments", projectId);
  copyDir(artifactDir, deployedDir);

  const requireRuntime = eval("require") as NodeRequire;
  const runner = requireRuntime(
    process.cwd() +
      "/services/sovereign-runtime/dist/apps/generatedAppRunner.js"
  );

  let generatedApp: any;

  try {
    generatedApp = await runner.startGeneratedApp(projectId);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        projectId,
        status: "deploy-failed",
        error: "Generated application failed to start.",
        detail: String(error),
      },
      { status: 500 }
    );
  }

  const manifestDir = path.join(RUNTIME_ROOT, "data", "deployments");
  fs.mkdirSync(manifestDir, { recursive: true });

  const deployment = {
    ok: true,
    projectId,
    status: generatedApp?.status || "starting",
    deployedAt: new Date().toISOString(),
    publicUrl: `/generated-app/${projectId}`,
    previewUrl: `/deployed/${projectId}`,
    generatedAppUrl: `/generated-app/${projectId}`,
    artifactDir,
    deployedDir,
    generatedApp,
  };

  fs.writeFileSync(
    path.join(manifestDir, `${projectId}.json`),
    JSON.stringify(deployment, null, 2)
  );

  return NextResponse.json(deployment);
}
