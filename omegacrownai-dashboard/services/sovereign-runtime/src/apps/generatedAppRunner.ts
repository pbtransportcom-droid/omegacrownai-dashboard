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
  for (const char of projectId) {
    hash =
      (hash + char.charCodeAt(0)) %
      500;
  }

  return 5200 + hash;
}

// GENERATED_APP_ATOMIC_PORT_RESERVATION
//
// Port availability checks contain an await boundary. Two concurrent
// generated-app starts can therefore observe the same port as free before
// either child binds it. Keep an in-process ownership reservation from
// allocation until the child either owns the listening socket or reaches
// a terminal state.
const generatedAppPortReservations =
  new Map<number, string>();

function releaseGeneratedAppPort(
  projectId: string,
  port: number
) {
  if (
    generatedAppPortReservations.get(port) ===
    projectId
  ) {
    generatedAppPortReservations.delete(port);
  }
}

// GENERATED_APP_COLLISION_SAFE_PORT_ALLOCATION
//
// Preserve the deterministic project port as the preferred starting point,
// but never assign a port that is already listening. Search the bounded
// generated-app range exactly once and fail safely if every slot is occupied.
async function allocateGeneratedAppPort(
  projectId: string
) {
  const preferredPort =
    portForProject(projectId);

  const minimumPort = 5200;
  const maximumPort = 5699;
  const rangeSize =
    maximumPort - minimumPort + 1;

  for (
    let offset = 0;
    offset < rangeSize;
    offset += 1
  ) {
    const port =
      minimumPort +
      (
        preferredPort -
        minimumPort +
        offset
      ) %
        rangeSize;

    if (
      generatedAppPortReservations.has(
        port
      )
    ) {
      continue;
    }

    const portCheck =
      await checkPort(
        port,
        "/"
      );

    // The availability probe above is asynchronous. Another allocator may
    // have claimed this port while this request was awaiting checkPort().
    // Recheck reservation ownership before synchronously claiming it.
    if (
      !portCheck.reachable &&
      !generatedAppPortReservations.has(
        port
      )
    ) {
      generatedAppPortReservations.set(
        port,
        projectId
      );

      return port;
    }
  }

  throw new Error(
    "No generated application ports are available."
  );
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


// GENERATED_APP_PERSISTED_LIFECYCLE_STATE
//
// Persist lifecycle transitions only when the manifest still belongs to the
// same generated-app process. This prevents an old child, monitor, or exit
// callback from overwriting state for a newer restart.
function persistGeneratedAppLifecycle(
  projectId: string,
  expectedPid: number,
  patch: Record<string, unknown>
) {
  const manifestPath =
    generatedAppManifestPath(projectId);

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  let current: any;

  try {
    current =
      JSON.parse(
        fs.readFileSync(
          manifestPath,
          "utf8"
        )
      );
  } catch {
    return null;
  }

  if (
    Number(current?.pid || 0) !==
    Number(expectedPid)
  ) {
    return null;
  }

  const updated = {
    ...current,
    ...patch,
  };

  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      updated,
      null,
      2
    )
  );

  return updated;
}

const GENERATED_APP_READINESS_TIMEOUT_MS =
  Number(
    process.env
      .GENERATED_APP_READINESS_TIMEOUT_MS ||
      10 * 60 * 1000
  );

async function monitorGeneratedAppReadiness(
  projectId: string,
  pid: number,
  port: number
) {
  const started = Date.now();

  while (
    Date.now() - started <
    GENERATED_APP_READINESS_TIMEOUT_MS
  ) {
    let processAlive = false;

    try {
      process.kill(pid, 0);
      processAlive = true;
    } catch {
      processAlive = false;
    }

    if (!processAlive) {
      releaseGeneratedAppPort(
        projectId,
        port
      );

      persistGeneratedAppLifecycle(
        projectId,
        pid,
        {
          status: "failed",
          processAlive: false,
          portReachable: false,
          failedAt:
            new Date().toISOString(),
          checkedAt:
            new Date().toISOString(),
        }
      );

      return;
    }

    const portCheck =
      await checkPort(
        port,
        "/"
      );

    if (portCheck.reachable) {
      releaseGeneratedAppPort(
        projectId,
        port
      );

      persistGeneratedAppLifecycle(
        projectId,
        pid,
        {
          status: "running",
          processAlive: true,
          portReachable: true,
          portStatus:
            portCheck.status,
          portError: undefined,
          readyAt:
            new Date().toISOString(),
          checkedAt:
            new Date().toISOString(),
        }
      );

      return;
    }

    await sleep(1000);
  }

  // A cold generated application may still be installing/building when the
  // readiness window ends. Preserve "starting" when the child is alive;
  // do not incorrectly convert a slow build into a failed deployment.
  let processAlive = false;

  try {
    process.kill(pid, 0);
    processAlive = true;
  } catch {
    processAlive = false;
  }

  if (!processAlive) {
    releaseGeneratedAppPort(
      projectId,
      port
    );
  }

  persistGeneratedAppLifecycle(
    projectId,
    pid,
    processAlive
      ? {
          status: "starting",
          processAlive: true,
          portReachable: false,
          readinessTimedOut: true,
          checkedAt:
            new Date().toISOString(),
        }
      : {
          status: "failed",
          processAlive: false,
          portReachable: false,
          readinessTimedOut: true,
          failedAt:
            new Date().toISOString(),
          checkedAt:
            new Date().toISOString(),
        }
  );
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

  const port =
    await allocateGeneratedAppPort(
      projectId
    );
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

  // GENERATED_APP_WARM_RESTART
  // If a previously prepared runnable application still has its
  // production build and installed dependencies, reuse that runnable
  // copy instead of deleting it, reinstalling packages, and rebuilding.
  // prepareGeneratedApp remains the cold-start path when the runnable
  // copy is missing or incomplete.
  const reusableAppDir =
    existing?.appDir &&
    fs.existsSync(path.join(existing.appDir, "package.json")) &&
    fs.existsSync(path.join(existing.appDir, ".next", "BUILD_ID")) &&
    fs.existsSync(path.join(existing.appDir, "node_modules"));

  const manifest = reusableAppDir
    ? {
        ...existing,
        ok: true,
        projectId,
        status: "prepared",
        warmRestart: true,
      }
    : await prepareGeneratedApp(projectId);

  const logDir = path.join(RUNTIME_ROOT, "logs", "generated-apps");
  fs.mkdirSync(logDir, { recursive: true });

  const out = fs.openSync(path.join(logDir, `${projectId}.out.log`), "a");
  const err = fs.openSync(path.join(logDir, `${projectId}.err.log`), "a");

  const child = spawn(
    "bash",
    [
      "-lc",
      reusableAppDir
        ? `cd "${manifest.appDir}" && PORT=${manifest.port} npm run start`
        : `cd "${manifest.appDir}" && npm install && npm run build && PORT=${manifest.port} npm run start`,
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

  // GENERATED_APP_CHILD_TERMINAL_STATE
  //
  // Persist unexpected process termination while the sovereign runtime
  // remains online. Ownership checks prevent stale children from changing
  // the state of a newer restart.
  child.once("error", (error) => {
    releaseGeneratedAppPort(
      projectId,
      Number(manifest.port)
    );

    persistGeneratedAppLifecycle(
      projectId,
      Number(child.pid || 0),
      {
        status: "failed",
        processAlive: false,
        portReachable: false,
        portStatus: undefined,
        failedAt:
          new Date().toISOString(),
        processError:
          String(error),
        checkedAt:
          new Date().toISOString(),
      }
    );
  });

  child.once(
    "exit",
    (code, signal) => {
      const current =
        getGeneratedAppManifest(
          projectId
        );

      if (
        Number(current?.pid || 0) !==
        Number(child.pid || 0)
      ) {
        return;
      }

      if (
        current?.status === "stopped" ||
        current?.autoStopped === true
      ) {
        return;
      }

      releaseGeneratedAppPort(
        projectId,
        Number(manifest.port)
      );

      persistGeneratedAppLifecycle(
        projectId,
        Number(child.pid || 0),
        {
          status:
            code === 0
              ? "stopped"
              : "failed",
          processAlive: false,
          portReachable: false,
          portStatus: undefined,
          exitCode: code,
          exitSignal: signal,
          ...(code === 0
            ? {
                stoppedAt:
                  new Date().toISOString(),
              }
            : {
                failedAt:
                  new Date().toISOString(),
              }),
          checkedAt:
            new Date().toISOString(),
        }
      );
    }
  );

  child.unref();

  const now = Date.now();
  const expiresAt = new Date(now + GENERATED_PREVIEW_TTL_MS).toISOString();

  const running = {
    ...manifest,
    pid: child.pid,
    status: "starting",
    watchdogPid: undefined,
    autoStopped: undefined,
    stoppedAt: undefined,
    portDown: undefined,
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

  const runningWithWatchdog = {
    ...running,
    watchdogPid: watchdog.pid,
  };

  fs.writeFileSync(
    generatedAppManifestPath(projectId),
    JSON.stringify(runningWithWatchdog, null, 2)
  );

  // GENERATED_APP_ASYNC_READINESS_RECONCILIATION
  //
  // Do not hold the deploy request open for a potentially long npm install
  // and production build. The API may return the explicit "starting" state,
  // while this monitor persists the authoritative transition to "running"
  // as soon as the generated server actually answers on its assigned port.
  void monitorGeneratedAppReadiness(
    projectId,
    Number(child.pid),
    Number(manifest.port)
  ).catch(() => {
    releaseGeneratedAppPort(
      projectId,
      Number(manifest.port)
    );

    persistGeneratedAppLifecycle(
      projectId,
      Number(child.pid),
      {
        status: "failed",
        processAlive: false,
        portReachable: false,
        failedAt:
          new Date().toISOString(),
        checkedAt:
          new Date().toISOString(),
      }
    );
  });

  return runningWithWatchdog;
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

  const reconciledStatus =
    portCheck.reachable
      ? "running"
      : processAlive
        ? "starting"
        : "stopped";

  const checkedAt =
    new Date().toISOString();

  const reconciled = {
    ...manifest,
    status: reconciledStatus,
    processAlive,
    portReachable:
      portCheck.reachable,
    portStatus:
      portCheck.status,
    portError:
      portCheck.error,
    checkedAt,
    ...(reconciledStatus === "running" &&
    !manifest.readyAt
      ? {
          readyAt: checkedAt,
        }
      : {}),
    ...(reconciledStatus === "stopped" &&
    !manifest.stoppedAt
      ? {
          stoppedAt: checkedAt,
        }
      : {}),
  };

  // GENERATED_APP_STATUS_PERSISTENCE
  //
  // Status checks are also reconciliation points. Persist the observed
  // process/port truth so deployment manifests do not remain permanently
  // "starting" after the generated server becomes reachable.
  persistGeneratedAppLifecycle(
    projectId,
    Number(manifest.pid),
    reconciled
  );

  return {
    ok: true,
    ...reconciled,
  };
}

export async function stopGeneratedApp(projectId: string) {
  const manifest = getGeneratedAppManifest(projectId);

  if (manifest?.port) {
    releaseGeneratedAppPort(
      projectId,
      Number(manifest.port)
    );
  }

  if (!manifest?.pid) {
    return { ok: false, projectId, status: "not-running" };
  }

  const pid = Number(manifest.pid);

  // GENERATED_APP_WATCHDOG_OWNERSHIP
  // Every generated-app process owns exactly one TTL watchdog.
  // Stop that watchdog when the application is explicitly stopped
  // or restarted so obsolete sleep processes do not accumulate.
  const watchdogPid = Number(manifest.watchdogPid || 0);

  if (
    Number.isInteger(watchdogPid) &&
    watchdogPid > 1 &&
    watchdogPid !== process.pid
  ) {
    try {
      process.kill(-watchdogPid, "SIGTERM");
    } catch {
      try {
        process.kill(watchdogPid, "SIGTERM");
      } catch {}
    }
  }

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
