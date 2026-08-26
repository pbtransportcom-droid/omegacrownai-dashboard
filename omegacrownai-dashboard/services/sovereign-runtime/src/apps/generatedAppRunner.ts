import fs from "fs";
import path from "path";
import { execFileSync, spawn } from "child_process";
import http from "http";

const ROOT = process.cwd();

// GENERATED_APP_CWD_SAFE_RUNTIME_ROOT
//
// Sovereign Runtime may be launched either from the application repository
// root or directly from services/sovereign-runtime. Resolve both execution
// contexts to one canonical runtime root instead of appending the service
// path twice when cwd already points at the runtime package.
const RUNTIME_ROOT =
  ROOT.endsWith(
    path.join(
      "services",
      "sovereign-runtime"
    )
  )
    ? ROOT
    : path.resolve(
        ROOT,
        "services",
        "sovereign-runtime"
      );
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

// GENERATED_APP_NON_DESTRUCTIVE_OWNERSHIP_CLASSIFIER
//
// Current Linux state is authoritative. Persisted PID, port, processAlive,
// portReachable, and watchdogPid fields are claims only.
//
// This classifier is observational only.
// It does NOT terminate processes, process groups, watchdogs, or ports.
// It does NOT mutate manifests or lifecycle state.

export type GeneratedAppOwnershipEvidence = {
  ok: boolean;
  projectId: string;

  manifestPid?: number;
  manifestPort?: number;
  manifestAppDir?: string;

  pidAlive: boolean;

  listenerExists: boolean;
  listenerPids: number[];

  listenerPid?: number;
  listenerCwd?: string;
  listenerCwdMatch: boolean;

  listenerPgid?: number;
  listenerPgidMatch: boolean;

  listenerAncestry: number[];
  listenerAncestorMatch: boolean;

  processOwnership: boolean;
  processOwnershipReasons: string[];

  watchdogPid?: number;
  watchdogAlive: boolean;
  watchdogCommand?: string;

  watchdogProjectMatch: boolean;
  watchdogPidMatch: boolean;
  watchdogPortMatch: boolean;

  watchdogOwnership: boolean;
  watchdogOwnershipReasons: string[];
};

type LinuxProcessIdentity = {
  alive: boolean;
  pid: number;
  ppid?: number;
  pgid?: number;
  cwd?: string;
  command?: string;
};

function readLinuxProcessIdentity(
  pid: number
): LinuxProcessIdentity {
  const dead: LinuxProcessIdentity = {
    alive: false,
    pid,
  };

  if (
    !Number.isInteger(pid) ||
    pid <= 1
  ) {
    return dead;
  }

  const procDir = `/proc/${pid}`;

  if (!fs.existsSync(procDir)) {
    return dead;
  }

  let stat: string;

  try {
    stat = fs.readFileSync(
      path.join(procDir, "stat"),
      "utf8"
    );
  } catch {
    return dead;
  }

  // Field 2 in /proc/<pid>/stat is "(comm)" and may contain spaces.
  // Everything following its final ")" begins with field 3 (state).
  const closeParen =
    stat.lastIndexOf(")");

  if (closeParen < 0) {
    return dead;
  }

  const fields =
    stat
      .slice(closeParen + 1)
      .trim()
      .split(/\s+/);

  // fields[0] = state  (field 3)
  // fields[1] = ppid   (field 4)
  // fields[2] = pgrp   (field 5)
  const parsedPpid =
    Number(fields[1]);

  const parsedPgid =
    Number(fields[2]);

  if (
    !Number.isInteger(parsedPpid) ||
    parsedPpid < 0 ||
    !Number.isInteger(parsedPgid) ||
    parsedPgid <= 0
  ) {
    return dead;
  }

  let cwd: string | undefined;

  try {
    cwd = fs.readlinkSync(
      path.join(procDir, "cwd")
    );
  } catch {
    cwd = undefined;
  }

  let command: string | undefined;

  try {
    command =
      fs.readFileSync(
        path.join(procDir, "cmdline")
      )
        .toString("utf8")
        .split("\0")
        .filter(Boolean)
        .join(" ");
  } catch {
    command = undefined;
  }

  return {
    alive: true,
    pid,
    ppid: parsedPpid,
    pgid: parsedPgid,
    cwd,
    command,
  };
}

function readLinuxProcessAncestry(
  pid: number,
  maxDepth = 64
): number[] {
  const ancestry: number[] = [];
  const visited =
    new Set<number>();

  let currentPid = pid;

  for (
    let depth = 0;
    depth < maxDepth;
    depth += 1
  ) {
    if (
      !Number.isInteger(currentPid) ||
      currentPid <= 1 ||
      visited.has(currentPid)
    ) {
      break;
    }

    visited.add(currentPid);

    const identity =
      readLinuxProcessIdentity(
        currentPid
      );

    if (
      !identity.alive ||
      !Number.isInteger(identity.ppid)
    ) {
      break;
    }

    const parentPid =
      Number(identity.ppid);

    ancestry.push(parentPid);

    if (parentPid <= 1) {
      break;
    }

    currentPid = parentPid;
  }

  return ancestry;
}

function localAddressMatchesPort(
  localAddress: string,
  port: number
): boolean {
  const match =
    localAddress.match(
      /:(\d+)$/
    );

  return Boolean(
    match &&
    Number(match[1]) === port
  );
}

function findTcpListenerPids(
  port: number
): number[] {
  if (
    !Number.isInteger(port) ||
    port <= 0 ||
    port > 65535
  ) {
    return [];
  }

  let output = "";

  try {
    output = String(
      execFileSync(
        "ss",
        ["-ltnpH"],
        {
          encoding: "utf8",
          stdio: [
            "ignore",
            "pipe",
            "ignore",
          ],
        }
      )
    );
  } catch {
    return [];
  }

  const pids =
    new Set<number>();

  for (
    const line of output.split("\n")
  ) {
    const trimmed =
      line.trim();

    if (!trimmed) {
      continue;
    }

    const columns =
      trimmed.split(/\s+/);

    // ss -ltnpH:
    // State Recv-Q Send-Q Local Peer Process
    const localAddress =
      columns[3] || "";

    if (
      !localAddressMatchesPort(
        localAddress,
        port
      )
    ) {
      continue;
    }

    const pidPattern =
      /pid=(\d+)/g;

    let match:
      RegExpExecArray | null;

    while (
      (
        match =
          pidPattern.exec(trimmed)
      ) !== null
    ) {
      const listenerPid =
        Number(match[1]);

      if (
        Number.isInteger(listenerPid) &&
        listenerPid > 1
      ) {
        pids.add(listenerPid);
      }
    }
  }

  return Array.from(pids);
}

function commandReferencesNumber(
  command: string | undefined,
  value: number
): boolean {
  if (
    !command ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    return false;
  }

  // value is already constrained to an integer, so no regex escaping is
  // required. Numeric boundaries prevent partial PID/port matches.
  const pattern =
    new RegExp(
      "(^|\\D)" +
      String(value) +
      "(?!\\d)"
    );

  return pattern.test(command);
}

export function classifyGeneratedAppOwnership(
  projectId: string
): GeneratedAppOwnershipEvidence {
  const manifest =
    getGeneratedAppManifest(
      projectId
    );

  const manifestPid =
    Number(
      manifest?.pid ||
      0
    );

  const manifestPort =
    Number(
      manifest?.port ||
      0
    );

  const manifestAppDir =
    typeof manifest?.appDir ===
      "string"
      ? manifest.appDir
      : undefined;

  const watchdogPid =
    Number(
      manifest?.watchdogPid ||
      0
    );

  const processIdentity =
    readLinuxProcessIdentity(
      manifestPid
    );

  const listenerPids =
    findTcpListenerPids(
      manifestPort
    );

  type ListenerCandidate = {
    pid: number;
    cwd?: string;
    pgid?: number;
    ancestry: number[];
    cwdMatch: boolean;
    pgidMatch: boolean;
    ancestorMatch: boolean;
    ownsProcess: boolean;
  };

  const listenerCandidates:
    ListenerCandidate[] =
      listenerPids.map(
        (listenerPid) => {
          const identity =
            readLinuxProcessIdentity(
              listenerPid
            );

          const ancestry =
            readLinuxProcessAncestry(
              listenerPid
            );

          const cwdMatch =
            Boolean(
              identity.alive &&
              manifestAppDir &&
              identity.cwd ===
                manifestAppDir
            );

          const pgidMatch =
            Boolean(
              identity.alive &&
              Number.isInteger(
                identity.pgid
              ) &&
              identity.pgid ===
                manifestPid
            );

          const ancestorMatch =
            ancestry.includes(
              manifestPid
            );

          return {
            pid: listenerPid,
            cwd: identity.cwd,
            pgid: identity.pgid,
            ancestry,
            cwdMatch,
            pgidMatch,
            ancestorMatch,

            ownsProcess:
              cwdMatch &&
              (
                pgidMatch ||
                ancestorMatch
              ),
          };
        }
      );

  // If multiple PIDs are reported for the socket, prefer one satisfying
  // the ownership quorum. Otherwise preserve the first listener solely as
  // diagnostic evidence.
  const selectedListener =
    listenerCandidates.find(
      (candidate) =>
        candidate.ownsProcess
    ) ||
    listenerCandidates[0];

  const listenerExists =
    listenerPids.length > 0;

  const listenerCwdMatch =
    selectedListener?.cwdMatch ===
      true;

  const listenerPgidMatch =
    selectedListener?.pgidMatch ===
      true;

  const listenerAncestorMatch =
    selectedListener?.ancestorMatch ===
      true;

  const processOwnership =
    Boolean(
      processIdentity.alive &&
      listenerExists &&
      listenerCwdMatch &&
      (
        listenerPgidMatch ||
        listenerAncestorMatch
      )
    );

  const processOwnershipReasons:
    string[] = [];

  if (!manifest) {
    processOwnershipReasons.push(
      "manifest-missing"
    );
  }

  if (
    !Number.isInteger(
      manifestPid
    ) ||
    manifestPid <= 1
  ) {
    processOwnershipReasons.push(
      "manifest-pid-invalid"
    );
  } else if (
    !processIdentity.alive
  ) {
    processOwnershipReasons.push(
      "manifest-pid-not-alive"
    );
  }

  if (
    !Number.isInteger(
      manifestPort
    ) ||
    manifestPort <= 0 ||
    manifestPort > 65535
  ) {
    processOwnershipReasons.push(
      "manifest-port-invalid"
    );
  } else if (
    !listenerExists
  ) {
    processOwnershipReasons.push(
      "port-listener-missing"
    );
  }

  if (!manifestAppDir) {
    processOwnershipReasons.push(
      "manifest-app-dir-missing"
    );
  } else if (
    listenerExists &&
    !listenerCwdMatch
  ) {
    processOwnershipReasons.push(
      "listener-cwd-mismatch"
    );
  }

  if (
    listenerExists &&
    listenerCwdMatch &&
    !listenerPgidMatch &&
    !listenerAncestorMatch
  ) {
    processOwnershipReasons.push(
      "listener-structural-relationship-unproven"
    );
  }

  if (
    processOwnership &&
    processOwnershipReasons.length === 0
  ) {
    processOwnershipReasons.push(
      "process-ownership-proven"
    );
  }

  const watchdogIdentity =
    readLinuxProcessIdentity(
      watchdogPid
    );

  const watchdogCommand =
    watchdogIdentity.command;

  const expectedManifestPath =
    generatedAppManifestPath(
      projectId
    );

  const watchdogProjectMatch =
    Boolean(
      watchdogIdentity.alive &&
      watchdogCommand &&
      watchdogCommand.includes(
        expectedManifestPath
      )
    );

  const watchdogPidMatch =
    Boolean(
      watchdogIdentity.alive &&
      commandReferencesNumber(
        watchdogCommand,
        manifestPid
      )
    );

  const watchdogPortMatch =
    Boolean(
      watchdogIdentity.alive &&
      commandReferencesNumber(
        watchdogCommand,
        manifestPort
      )
    );

  const watchdogOwnership =
    Boolean(
      watchdogIdentity.alive &&
      watchdogProjectMatch &&
      watchdogPidMatch &&
      watchdogPortMatch
    );

  const watchdogOwnershipReasons:
    string[] = [];

  if (
    !Number.isInteger(
      watchdogPid
    ) ||
    watchdogPid <= 1
  ) {
    watchdogOwnershipReasons.push(
      "watchdog-pid-invalid"
    );
  } else if (
    !watchdogIdentity.alive
  ) {
    watchdogOwnershipReasons.push(
      "watchdog-not-alive"
    );
  }

  if (
    watchdogIdentity.alive &&
    !watchdogProjectMatch
  ) {
    watchdogOwnershipReasons.push(
      "watchdog-project-mismatch"
    );
  }

  if (
    watchdogIdentity.alive &&
    !watchdogPidMatch
  ) {
    watchdogOwnershipReasons.push(
      "watchdog-generated-pid-mismatch"
    );
  }

  if (
    watchdogIdentity.alive &&
    !watchdogPortMatch
  ) {
    watchdogOwnershipReasons.push(
      "watchdog-port-mismatch"
    );
  }

  if (
    watchdogOwnership &&
    watchdogOwnershipReasons.length === 0
  ) {
    watchdogOwnershipReasons.push(
      "watchdog-ownership-proven"
    );
  }

  return {
    ok: manifest !== null,
    projectId,

    manifestPid:
      Number.isInteger(
        manifestPid
      ) &&
      manifestPid > 1
        ? manifestPid
        : undefined,

    manifestPort:
      Number.isInteger(
        manifestPort
      ) &&
      manifestPort > 0 &&
      manifestPort <= 65535
        ? manifestPort
        : undefined,

    manifestAppDir,

    pidAlive:
      processIdentity.alive,

    listenerExists,
    listenerPids,

    listenerPid:
      selectedListener?.pid,

    listenerCwd:
      selectedListener?.cwd,

    listenerCwdMatch,

    listenerPgid:
      selectedListener?.pgid,

    listenerPgidMatch,

    listenerAncestry:
      selectedListener
        ?.ancestry ||
      [],

    listenerAncestorMatch,

    processOwnership,
    processOwnershipReasons,

    watchdogPid:
      Number.isInteger(
        watchdogPid
      ) &&
      watchdogPid > 1
        ? watchdogPid
        : undefined,

    watchdogAlive:
      watchdogIdentity.alive,

    watchdogCommand,

    watchdogProjectMatch,
    watchdogPidMatch,
    watchdogPortMatch,
    watchdogOwnership,
    watchdogOwnershipReasons,
  };
}


// GENERATED_APP_OWNERSHIP_GATED_EXPIRED_CLEANUP
//
// Stage 4.2E1 introduces a reusable destructive helper but does NOT wire it
// into startup reconciliation yet.
//
// Safety properties:
// - manifest must currently be expired
// - ownership is classified from current Linux state
// - watchdog and application ownership remain independent
// - a live but unverified watchdog causes fail-closed deferral
// - ownership is reclassified immediately before application SIGTERM
// - no fuser port kill
// - no SIGKILL
// - listener shutdown must be observed before terminalizing the manifest

export type GeneratedAppExpiredCleanupResult = {
  ok: boolean;
  projectId: string;
  attempted: boolean;
  completed: boolean;
  deferred: boolean;

  processOwnership: boolean;
  watchdogOwnership: boolean;

  watchdogSignalAttempted: boolean;
  processSignalAttempted: boolean;

  portDown?: {
    down: boolean;
    waitedMs: number;
  };

  reasons: string[];
};

function signalOwnedProcessTerm(
  pid: number
): boolean {
  if (
    !Number.isInteger(pid) ||
    pid <= 1 ||
    pid === process.pid
  ) {
    return false;
  }

  try {
    process.kill(
      -pid,
      "SIGTERM"
    );

    return true;
  } catch {
    try {
      process.kill(
        pid,
        "SIGTERM"
      );

      return true;
    } catch {
      return false;
    }
  }
}

export async function cleanupExpiredGeneratedAppIfOwned(
  projectId: string
): Promise<GeneratedAppExpiredCleanupResult> {
  const reasons: string[] = [];

  const manifest =
    getGeneratedAppManifest(
      projectId
    );

  if (!manifest) {
    return {
      ok: false,
      projectId,
      attempted: false,
      completed: false,
      deferred: true,
      processOwnership: false,
      watchdogOwnership: false,
      watchdogSignalAttempted: false,
      processSignalAttempted: false,
      reasons: [
        "manifest-missing",
      ],
    };
  }

  const pid =
    Number(
      manifest?.pid ||
      0
    );

  const port =
    Number(
      manifest?.port ||
      0
    );

  const watchdogPid =
    Number(
      manifest?.watchdogPid ||
      0
    );

  const expiresAtMs =
    Date.parse(
      String(
        manifest?.expiresAt ||
        ""
      )
    );

  const expired =
    Number.isFinite(
      expiresAtMs
    ) &&
    expiresAtMs <= Date.now();

  if (!expired) {
    return {
      ok: false,
      projectId,
      attempted: false,
      completed: false,
      deferred: true,
      processOwnership: false,
      watchdogOwnership: false,
      watchdogSignalAttempted: false,
      processSignalAttempted: false,
      reasons: [
        "manifest-not-expired",
      ],
    };
  }

  const initialOwnership =
    classifyGeneratedAppOwnership(
      projectId
    );

  if (
    initialOwnership.watchdogAlive &&
    !initialOwnership.watchdogOwnership
  ) {
    reasons.push(
      "live-watchdog-ownership-unproven"
    );

    persistGeneratedAppLifecycle(
      projectId,
      pid,
      {
        expirationCleanupDeferred: true,
        expirationCleanupAttemptedAt:
          new Date().toISOString(),

        processOwnership:
          initialOwnership.processOwnership,

        processOwnershipReasons:
          initialOwnership.processOwnershipReasons,

        watchdogOwnership:
          initialOwnership.watchdogOwnership,

        watchdogOwnershipReasons:
          initialOwnership.watchdogOwnershipReasons,

        expirationCleanupReasons:
          reasons,
      }
    );

    return {
      ok: true,
      projectId,
      attempted: false,
      completed: false,
      deferred: true,
      processOwnership:
        initialOwnership.processOwnership,
      watchdogOwnership:
        initialOwnership.watchdogOwnership,
      watchdogSignalAttempted: false,
      processSignalAttempted: false,
      reasons,
    };
  }

  if (
    !initialOwnership.processOwnership
  ) {
    reasons.push(
      ...initialOwnership
        .processOwnershipReasons
    );

    persistGeneratedAppLifecycle(
      projectId,
      pid,
      {
        expirationCleanupDeferred: true,
        expirationCleanupAttemptedAt:
          new Date().toISOString(),

        processOwnership:
          initialOwnership.processOwnership,

        processOwnershipReasons:
          initialOwnership.processOwnershipReasons,

        watchdogOwnership:
          initialOwnership.watchdogOwnership,

        watchdogOwnershipReasons:
          initialOwnership.watchdogOwnershipReasons,

        expirationCleanupReasons:
          reasons,
      }
    );

    return {
      ok: true,
      projectId,
      attempted: false,
      completed: false,
      deferred: true,
      processOwnership: false,
      watchdogOwnership:
        initialOwnership.watchdogOwnership,
      watchdogSignalAttempted: false,
      processSignalAttempted: false,
      reasons,
    };
  }

  let watchdogSignalAttempted =
    false;

  if (
    initialOwnership.watchdogAlive &&
    initialOwnership.watchdogOwnership
  ) {
    // Reclassify immediately before signaling the watchdog.
    const watchdogRecheck =
      classifyGeneratedAppOwnership(
        projectId
      );

    if (
      !watchdogRecheck.watchdogAlive ||
      !watchdogRecheck.watchdogOwnership ||
      Number(
        watchdogRecheck.watchdogPid ||
        0
      ) !== watchdogPid
    ) {
      reasons.push(
        "watchdog-revalidation-failed"
      );

      persistGeneratedAppLifecycle(
        projectId,
        pid,
        {
          expirationCleanupDeferred: true,
          expirationCleanupAttemptedAt:
            new Date().toISOString(),
          expirationCleanupReasons:
            reasons,
        }
      );

      return {
        ok: true,
        projectId,
        attempted: false,
        completed: false,
        deferred: true,
        processOwnership:
          watchdogRecheck.processOwnership,
        watchdogOwnership:
          watchdogRecheck.watchdogOwnership,
        watchdogSignalAttempted: false,
        processSignalAttempted: false,
        reasons,
      };
    }

    watchdogSignalAttempted =
      signalOwnedProcessTerm(
        watchdogPid
      );

    if (!watchdogSignalAttempted) {
      reasons.push(
        "watchdog-sigterm-failed"
      );

      persistGeneratedAppLifecycle(
        projectId,
        pid,
        {
          expirationCleanupDeferred: true,
          expirationCleanupAttemptedAt:
            new Date().toISOString(),
          expirationCleanupReasons:
            reasons,
        }
      );

      return {
        ok: true,
        projectId,
        attempted: true,
        completed: false,
        deferred: true,
        processOwnership: true,
        watchdogOwnership: true,
        watchdogSignalAttempted: true,
        processSignalAttempted: false,
        reasons,
      };
    }
  }

  // Reclassify current application ownership immediately before SIGTERM.
  // Persisted ownership evidence from startup is never authorization.
  const processRecheck =
    classifyGeneratedAppOwnership(
      projectId
    );

  if (
    !processRecheck.processOwnership ||
    Number(
      processRecheck.manifestPid ||
      0
    ) !== pid
  ) {
    reasons.push(
      "process-revalidation-failed"
    );

    reasons.push(
      ...processRecheck
        .processOwnershipReasons
    );

    persistGeneratedAppLifecycle(
      projectId,
      pid,
      {
        expirationCleanupDeferred: true,
        expirationCleanupAttemptedAt:
          new Date().toISOString(),

        processOwnership:
          processRecheck.processOwnership,

        processOwnershipReasons:
          processRecheck.processOwnershipReasons,

        expirationCleanupReasons:
          reasons,
      }
    );

    return {
      ok: true,
      projectId,
      attempted:
        watchdogSignalAttempted,
      completed: false,
      deferred: true,
      processOwnership:
        processRecheck.processOwnership,
      watchdogOwnership:
        processRecheck.watchdogOwnership,
      watchdogSignalAttempted,
      processSignalAttempted: false,
      reasons,
    };
  }

  const processSignalAttempted =
    signalOwnedProcessTerm(
      pid
    );

  if (!processSignalAttempted) {
    reasons.push(
      "process-sigterm-failed"
    );

    persistGeneratedAppLifecycle(
      projectId,
      pid,
      {
        expirationCleanupDeferred: true,
        expirationCleanupAttemptedAt:
          new Date().toISOString(),
        expirationCleanupReasons:
          reasons,
      }
    );

    return {
      ok: true,
      projectId,
      attempted: true,
      completed: false,
      deferred: true,
      processOwnership: true,
      watchdogOwnership:
        initialOwnership.watchdogOwnership,
      watchdogSignalAttempted,
      processSignalAttempted: true,
      reasons,
    };
  }

  let portDown = {
    down: true,
    waitedMs: 0,
  };

  if (
    Number.isInteger(port) &&
    port > 0
  ) {
    portDown =
      await waitForPortDown(
        port,
        20000
      );
  }

  if (!portDown.down) {
    reasons.push(
      "listener-still-up-after-sigterm"
    );

    persistGeneratedAppLifecycle(
      projectId,
      pid,
      {
        expirationCleanupDeferred: true,
        expirationCleanupAttemptedAt:
          new Date().toISOString(),
        expirationCleanupReasons:
          reasons,
        portDown,
      }
    );

    return {
      ok: true,
      projectId,
      attempted: true,
      completed: false,
      deferred: true,
      processOwnership: true,
      watchdogOwnership:
        initialOwnership.watchdogOwnership,
      watchdogSignalAttempted,
      processSignalAttempted: true,
      portDown,
      reasons,
    };
  }

  if (
    Number.isInteger(port) &&
    port > 0
  ) {
    releaseGeneratedAppPort(
      projectId,
      port
    );
  }

  const stoppedAt =
    new Date().toISOString();

  persistGeneratedAppLifecycle(
    projectId,
    pid,
    {
      status: "stopped",
      processAlive: false,
      portReachable: false,
      portStatus: undefined,

      expired: true,
      expiredAt:
        manifest?.expiredAt ||
        stoppedAt,

      autoStopped: true,
      stoppedAt,

      expirationCleanupDeferred:
        false,

      expirationCleanupCompleted:
        true,

      expirationCleanupCompletedAt:
        stoppedAt,

      expirationCleanupMethod:
        "ownership-gated-sigterm",

      expirationCleanupReasons:
        [
          "ownership-proven",
          "sigterm-complete",
        ],

      portDown,
    }
  );

  return {
    ok: true,
    projectId,
    attempted: true,
    completed: true,
    deferred: false,
    processOwnership: true,
    watchdogOwnership:
      initialOwnership.watchdogOwnership,
    watchdogSignalAttempted,
    processSignalAttempted: true,
    portDown,
    reasons: [
      "ownership-proven",
      "sigterm-complete",
    ],
  };
}


// GENERATED_APP_STARTUP_RECONCILIATION
//
// Persisted generated-app manifests survive Sovereign Runtime restarts.
// Reconcile non-terminal manifests at boot so stale "starting"/"running"
// state does not remain indefinitely until an individual status request.
//
// This stage intentionally does not terminate a still-live expired PID.
// Destructive expired-process ownership cleanup is handled separately after
// PID/port ownership can be proven safely.
export async function reconcileGeneratedAppsOnStartup() {
  const manifestDir = path.join(
    RUNTIME_ROOT,
    "data",
    "generated-apps"
  );

  fs.mkdirSync(
    manifestDir,
    {
      recursive: true,
    }
  );

  const files =
    fs.readdirSync(manifestDir)
      .filter(
        (name) =>
          /^OC-[A-Z0-9]+\.json$/i.test(name)
      );

  const summary = {
    scanned: 0,
    reconciled: 0,
    expiredDead: 0,
    staleActive: 0,
    skippedTerminal: 0,
    invalid: 0,
    liveExpiredDeferred: 0,
  };

  for (const file of files) {
    summary.scanned += 1;

    const manifestPath =
      path.join(
        manifestDir,
        file
      );

    let manifest: any;

    try {
      manifest =
        JSON.parse(
          fs.readFileSync(
            manifestPath,
            "utf8"
          )
        );
    } catch {
      summary.invalid += 1;
      continue;
    }

    const projectId =
      String(
        manifest?.projectId ||
        file.replace(/\.json$/i, "")
      );

    const status =
      String(
        manifest?.status ||
        ""
      );

    if (
      status === "stopped" ||
      status === "failed" ||
      status === "stopping-timeout"
    ) {
      summary.skippedTerminal += 1;
      continue;
    }

    const pid =
      Number(
        manifest?.pid ||
        0
      );

    let processAlive = false;

    if (
      Number.isInteger(pid) &&
      pid > 1
    ) {
      try {
        process.kill(
          pid,
          0
        );

        processAlive = true;
      } catch {
        processAlive = false;
      }
    }

    const expiresAtMs =
      Date.parse(
        String(
          manifest?.expiresAt ||
          ""
        )
      );

    const expired =
      Number.isFinite(expiresAtMs) &&
      expiresAtMs <= Date.now();

    if (
      expired &&
      !processAlive
    ) {
      const checkedAt =
        new Date().toISOString();

      persistGeneratedAppLifecycle(
        projectId,
        pid,
        {
          status: "stopped",
          processAlive: false,
          portReachable: false,
          portStatus: undefined,
          autoStopped: true,
          expired: true,
          expiredAt:
            manifest?.expiredAt ||
            checkedAt,
          stoppedAt:
            manifest?.stoppedAt ||
            checkedAt,
          checkedAt,
          reconciledAtStartup: true,
        }
      );

      if (manifest?.port) {
        releaseGeneratedAppPort(
          projectId,
          Number(manifest.port)
        );
      }

      summary.expiredDead += 1;
      summary.reconciled += 1;
      continue;
    }

    if (
      expired &&
      processAlive
    ) {
      // GENERATED_APP_STARTUP_OWNERSHIP_GATED_CLEANUP
      //
      // Stage 4.2E2 delegates destructive expiration cleanup to the
      // independently accepted helper. The helper reclassifies current
      // Linux ownership immediately before signaling and fails closed.
      const cleanup =
        await cleanupExpiredGeneratedAppIfOwned(
          projectId
        );

      persistGeneratedAppLifecycle(
        projectId,
        pid,
        {
          reconciledAtStartup: true,

          startupExpirationCleanupAttempted:
            cleanup.attempted,

          startupExpirationCleanupCompleted:
            cleanup.completed,

          startupExpirationCleanupDeferred:
            cleanup.deferred,

          startupExpirationCleanupReasons:
            cleanup.reasons,

          startupProcessOwnership:
            cleanup.processOwnership,

          startupWatchdogOwnership:
            cleanup.watchdogOwnership,

          checkedAt:
            new Date().toISOString(),
        }
      );

      if (cleanup.completed) {
        summary.expiredDead += 1;
      } else {
        summary.liveExpiredDeferred += 1;
      }

      summary.reconciled += 1;
      continue;
    }

    if (
      status === "starting" ||
      status === "running" ||
      status === "prepared"
    ) {
      const reconciled =
        await getGeneratedAppStatus(
          projectId
        );

      if (
        reconciled?.ok === true
      ) {
        persistGeneratedAppLifecycle(
          projectId,
          pid,
          {
            reconciledAtStartup: true,
            startupReconciledStatus:
              reconciled.status,
            checkedAt:
              new Date().toISOString(),
          }
        );
      }

      summary.staleActive += 1;
      summary.reconciled += 1;
    }
  }

  return summary;
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
