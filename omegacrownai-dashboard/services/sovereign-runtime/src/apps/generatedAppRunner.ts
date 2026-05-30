import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const ROOT = process.cwd();
const RUNTIME_ROOT = path.join(ROOT, "services", "sovereign-runtime");

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function portForProject(projectId: string) {
  let hash = 0;
  for (const char of projectId) hash = (hash + char.charCodeAt(0)) % 500;
  return 5200 + hash;
}

export async function prepareGeneratedApp(projectId: string) {
  const artifactDir = path.join(RUNTIME_ROOT, "data", "artifacts", projectId);
  const appDir = path.join(RUNTIME_ROOT, "generated-apps", projectId);

  if (!fs.existsSync(artifactDir)) {
    throw new Error(`Artifact folder not found for ${projectId}`);
  }

  fs.rmSync(appDir, { recursive: true, force: true });
  copyDir(artifactDir, appDir);

  const port = portForProject(projectId);
  const manifestDir = path.join(RUNTIME_ROOT, "data", "generated-apps");
  fs.mkdirSync(manifestDir, { recursive: true });

  const manifest = {
    ok: true,
    projectId,
    appDir,
    port,
    localUrl: `http://localhost:${port}`,
    publicPath: `/generated-app/${projectId}`,
    preparedAt: new Date().toISOString(),
    status: "prepared",
  };

  fs.writeFileSync(
    path.join(manifestDir, `${projectId}.json`),
    JSON.stringify(manifest, null, 2)
  );

  return manifest;
}

export async function startGeneratedApp(projectId: string) {
  const manifest = await prepareGeneratedApp(projectId);

  const logDir = path.join(RUNTIME_ROOT, "logs", "generated-apps");
  fs.mkdirSync(logDir, { recursive: true });

  const out = fs.openSync(path.join(logDir, `${projectId}.out.log`), "a");
  const err = fs.openSync(path.join(logDir, `${projectId}.err.log`), "a");

  const child = spawn(
    "bash",
    [
      "-lc",
      `cd "${manifest.appDir}" && npm install && npm run build && PORT=${manifest.port} npm run start`,
    ],
    {
      detached: true,
      stdio: ["ignore", out, err],
    }
  );

  child.unref();

  const running = {
    ...manifest,
    pid: child.pid,
    status: "starting",
    startedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(RUNTIME_ROOT, "data", "generated-apps", `${projectId}.json`),
    JSON.stringify(running, null, 2)
  );

  return running;
}
