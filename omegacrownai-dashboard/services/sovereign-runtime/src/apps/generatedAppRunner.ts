import fs from "fs";
import path from "path";
import { execFileSync, spawn } from "child_process";
import http from "http";

const ROOT = process.cwd();
const RUNTIME_ROOT = path.join(ROOT, "services", "sovereign-runtime");
const GENERATED_PREVIEW_TTL_MS = 30 * 60 * 1000;

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkPort(port: number, pathname = "/") {
  return new Promise<{ reachable: boolean; status?: number; error?: string }>((resolve) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: pathname,
        method: "GET",
        timeout: 2500,
      },
      (res) => {
        res.resume();
        resolve({ reachable: true, status: res.statusCode });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("timeout"));
    });

    req.on("error", (error) => {
      resolve({ reachable: false, error: String(error) });
    });

    req.end();
  });
}

function generatedAppManifestPath(projectId: string) {
  return path.join(RUNTIME_ROOT, "data", "generated-apps", `${projectId}.json`);
}

function killPort(port: number) {
  try {
    execFileSync("fuser", ["-k", `${port}/tcp`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function waitForPortDown(port: number, timeoutMs = 20000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const check = await checkPort(port, "/");
    if (!check.reachable) {
      return { down: true, waitedMs: Date.now() - started };
    }

    await sleep(500);
  }

  return { down: false, waitedMs: Date.now() - started };
}

export async function prepareGeneratedApp(projectId: string) {
  const artifactDir = path.join(RUNTIME_ROOT, "data", "artifacts", projectId);
  const appDir = path.join(RUNTIME_ROOT, "generated-apps", projectId);

  // GENERATED_APP_DURABLE_RUNTIME_DATA
  // Mutable customer/application data must live outside the disposable
  // generated-app directory because prepareGeneratedApp rebuilds appDir.
  const runtimeDataDir = path.join(
    RUNTIME_ROOT,
    "data",
    "runtime-apps",
    projectId
  );

  fs.mkdirSync(runtimeDataDir, {
    recursive: true,
  });

  // GENERATED_APP_LEGACY_RUNTIME_MIGRATION
  // Older generated applications persisted mutable state inside
  // generated-apps/<projectId>/data/runtime. Preserve that state
  // before the disposable runnable directory is rebuilt.
  const legacyRuntimeDataDir = path.join(
    appDir,
    "data",
    "runtime"
  );

  if (
    fs.existsSync(legacyRuntimeDataDir) &&
    !fs.lstatSync(legacyRuntimeDataDir).isSymbolicLink()
  ) {
    copyDir(
      legacyRuntimeDataDir,
      runtimeDataDir
    );
  }

  if (!fs.existsSync(artifactDir)) {
    throw new Error(`Artifact folder not found for ${projectId}`);
  }

  fs.rmSync(appDir, { recursive: true, force: true });
  copyDir(artifactDir, appDir);

  // GENERATED_APP_RUNTIME_DATA_MOUNT
  // Keep the historical process.cwd()/data/runtime contract working
  // while storing the actual mutable files outside disposable appDir.
  const generatedDataDir = path.join(
    appDir,
    "data"
  );

  const generatedRuntimeDataDir = path.join(
    generatedDataDir,
    "runtime"
  );

  fs.mkdirSync(generatedDataDir, {
    recursive: true,
  });

  fs.rmSync(
    generatedRuntimeDataDir,
    {
      recursive: true,
      force: true,
    }
  );

  fs.symlinkSync(
    runtimeDataDir,
    generatedRuntimeDataDir,
    "dir"
  );

  // GENERATED_APP_RUNTIME_DEPENDENCY_NORMALIZATION
  // Preserve the delivered artifact while ensuring the temporary runnable
  // copy uses the platform-tested dependency versions.
  const packagePath = path.join(appDir, "package.json");

  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    pkg.dependencies = {
      ...(pkg.dependencies || {}),
      "@prisma/client": "6.19.0",
      prisma: "6.19.0",
      "@types/node": "22.10.2",
      "@types/react": "19.0.2",
      "@types/react-dom": "19.0.2",
      next: "15.5.19",
      react: "19.0.0",
      "react-dom": "19.0.0",
      typescript: "5.7.2",
    };

    fs.writeFileSync(
      packagePath,
      JSON.stringify(pkg, null, 2) + "\n"
    );
  }

  const port = portForProject(projectId);
  const manifestDir = path.join(RUNTIME_ROOT, "data", "generated-apps");
  fs.mkdirSync(manifestDir, { recursive: true });

  const manifest = {
    ok: true,
    projectId,
    appDir,
    runtimeDataDir,
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
  // GENERATED_APP_SINGLE_START_GUARD
  // Never remove/rebuild the same runnable app while an earlier install,
  // build, or server process for that project is still alive.
  const existing = getGeneratedAppManifest(projectId);

  if (existing?.pid) {
    let processAlive = false;

    try {
      process.kill(Number(existing.pid), 0);
      processAlive = true;
    } catch {
      processAlive = false;
    }

    if (processAlive) {
      const portCheck = existing.port
        ? await checkPort(Number(existing.port), "/")
        : { reachable: false, error: "Missing port" };

      return {
        ...existing,
        ok: true,
        status: portCheck.reachable ? "running" : "starting",
        processAlive: true,
        portReachable: portCheck.reachable,
        portStatus: portCheck.status,
        portError: portCheck.error,
        reusedExistingProcess: true,
      };
    }
  }

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
      env: {
        ...process.env,
        OMEGACROWN_RUNTIME_DATA_DIR:
          manifest.runtimeDataDir,
      },
    }
  );

  child.unref();

  const now = Date.now();
  const expiresAt = new Date(now + GENERATED_PREVIEW_TTL_MS).toISOString();

  const running = {
    ...manifest,
    pid: child.pid,
    status: "starting",
    startedAt: new Date(now).toISOString(),
    expiresAt,
    ttlSeconds: Math.round(GENERATED_PREVIEW_TTL_MS / 1000),
  };

  fs.writeFileSync(
    generatedAppManifestPath(projectId),
    JSON.stringify(running, null, 2)
  );

  const watchdog = spawn(
    "bash",
    [
      "-lc",
      `sleep ${Math.ceil(GENERATED_PREVIEW_TTL_MS / 1000)}; node -e 'const fs=require("fs"); const p=${JSON.stringify(generatedAppManifestPath(projectId))}; if(!fs.existsSync(p)) process.exit(0); const m=JSON.parse(fs.readFileSync(p,"utf8")); if(String(m.pid)!=="${child.pid}") process.exit(0); require("child_process").spawnSync("fuser",["-k","${manifest.port}/tcp"],{stdio:"ignore"}); try{process.kill(-Number(m.pid),"SIGTERM")}catch(e){try{process.kill(Number(m.pid),"SIGTERM")}catch(e2){}} m.status="stopped"; m.autoStopped=true; m.stoppedAt=new Date().toISOString(); fs.writeFileSync(p,JSON.stringify(m,null,2));'`,
    ],
    {
      detached: true,
      stdio: "ignore",
    }
  );
  watchdog.unref();

  return running;
}

export function getGeneratedAppManifest(projectId: string) {
  const manifestPath = path.join(
    RUNTIME_ROOT,
    "data",
    "generated-apps",
    `${projectId}.json`
  );

  if (!fs.existsSync(manifestPath)) return null;
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

export async function getGeneratedAppStatus(projectId: string) {
  const manifest = getGeneratedAppManifest(projectId);

  if (!manifest?.pid) {
    return { ok: false, projectId, status: "not-running" };
  }

  let processAlive = false;
  try {
    process.kill(manifest.pid, 0);
    processAlive = true;
  } catch {
    processAlive = false;
  }

  const portCheck = manifest.port
    ? await checkPort(Number(manifest.port), "/")
    : { reachable: false, error: "Missing port" };

  return {
    ok: true,
    ...manifest,
    status: portCheck.reachable ? "running" : processAlive ? "starting" : "stopped",
    processAlive,
    portReachable: portCheck.reachable,
    portStatus: portCheck.status,
    portError: portCheck.error,
    checkedAt: new Date().toISOString(),
  };
}

export async function stopGeneratedApp(projectId: string) {
  const manifest = getGeneratedAppManifest(projectId);

  if (!manifest?.pid) {
    return { ok: false, projectId, status: "not-running" };
  }

  const pid = Number(manifest.pid);

  if (manifest.port) {
    killPort(Number(manifest.port));
  }

  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {}
  }

  let portDown = { down: true, waitedMs: 0 };
  if (manifest.port) {
    portDown = await waitForPortDown(Number(manifest.port), 20000);
  }

  if (!portDown.down) {
    if (manifest.port) {
      killPort(Number(manifest.port));
    }

    try {
      process.kill(-pid, "SIGKILL");
    } catch {
      try {
        process.kill(pid, "SIGKILL");
      } catch {}
    }

    if (manifest.port) {
      portDown = await waitForPortDown(Number(manifest.port), 10000);
    }
  }

  const stopped = {
    ...manifest,
    status: portDown.down ? "stopped" : "stopping-timeout",
    portDown,
    stoppedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(RUNTIME_ROOT, "data", "generated-apps", `${projectId}.json`),
    JSON.stringify(stopped, null, 2)
  );

  return stopped;
}

export async function restartGeneratedApp(projectId: string) {
  await stopGeneratedApp(projectId);
  return startGeneratedApp(projectId);
}

export function getGeneratedAppLogs(projectId: string) {
  const logDir = path.join(RUNTIME_ROOT, "logs", "generated-apps");
  const outPath = path.join(logDir, `${projectId}.out.log`);
  const errPath = path.join(logDir, `${projectId}.err.log`);

  return {
    ok: true,
    projectId,
    out: fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8").slice(-12000) : "",
    err: fs.existsSync(errPath) ? fs.readFileSync(errPath, "utf8").slice(-12000) : "",
  };
}
