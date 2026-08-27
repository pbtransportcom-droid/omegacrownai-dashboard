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
const RUNTIME_ROOT = ROOT.endsWith(path.join("services", "sovereign-runtime"))
    ? ROOT
    : path.resolve(ROOT, "services", "sovereign-runtime");
const GENERATED_PREVIEW_TTL_MS = 30 * 60 * 1000;
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory())
            copyDir(srcPath, destPath);
        else
            fs.copyFileSync(srcPath, destPath);
    }
}
function portForProject(projectId) {
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
const generatedAppPortReservations = new Map();
function releaseGeneratedAppPort(projectId, port) {
    if (generatedAppPortReservations.get(port) ===
        projectId) {
        generatedAppPortReservations.delete(port);
    }
}
// GENERATED_APP_COLLISION_SAFE_PORT_ALLOCATION
//
// Preserve the deterministic project port as the preferred starting point,
// but never assign a port that is already listening. Search the bounded
// generated-app range exactly once and fail safely if every slot is occupied.
async function allocateGeneratedAppPort(projectId) {
    const preferredPort = portForProject(projectId);
    const minimumPort = 5200;
    const maximumPort = 5699;
    const rangeSize = maximumPort - minimumPort + 1;
    for (let offset = 0; offset < rangeSize; offset += 1) {
        const port = minimumPort +
            (preferredPort -
                minimumPort +
                offset) %
                rangeSize;
        if (generatedAppPortReservations.has(port)) {
            continue;
        }
        const portCheck = await checkPort(port, "/");
        // The availability probe above is asynchronous. Another allocator may
        // have claimed this port while this request was awaiting checkPort().
        // Recheck reservation ownership before synchronously claiming it.
        if (!portCheck.reachable &&
            !generatedAppPortReservations.has(port)) {
            generatedAppPortReservations.set(port, projectId);
            return port;
        }
    }
    throw new Error("No generated application ports are available.");
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function checkPort(port, pathname = "/") {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: "127.0.0.1",
            port,
            path: pathname,
            method: "GET",
            timeout: 2500,
        }, (res) => {
            res.resume();
            resolve({ reachable: true, status: res.statusCode });
        });
        req.on("timeout", () => {
            req.destroy(new Error("timeout"));
        });
        req.on("error", (error) => {
            resolve({ reachable: false, error: String(error) });
        });
        req.end();
    });
}
function generatedAppManifestPath(projectId) {
    return path.join(RUNTIME_ROOT, "data", "generated-apps", `${projectId}.json`);
}
function killPort(port) {
    try {
        execFileSync("fuser", ["-k", `${port}/tcp`], { stdio: "ignore" });
        return true;
    }
    catch {
        return false;
    }
}
async function waitForPortDown(port, timeoutMs = 20000) {
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
function persistGeneratedAppLifecycle(projectId, expectedPid, patch) {
    const manifestPath = generatedAppManifestPath(projectId);
    if (!fs.existsSync(manifestPath)) {
        return null;
    }
    let current;
    try {
        current =
            JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    }
    catch {
        return null;
    }
    if (Number(current?.pid || 0) !==
        Number(expectedPid)) {
        return null;
    }
    const updated = {
        ...current,
        ...patch,
    };
    fs.writeFileSync(manifestPath, JSON.stringify(updated, null, 2));
    return updated;
}
const GENERATED_APP_READINESS_TIMEOUT_MS = Number(process.env
    .GENERATED_APP_READINESS_TIMEOUT_MS ||
    10 * 60 * 1000);
async function monitorGeneratedAppReadiness(projectId, pid, port) {
    const started = Date.now();
    while (Date.now() - started <
        GENERATED_APP_READINESS_TIMEOUT_MS) {
        let processAlive = false;
        try {
            process.kill(pid, 0);
            processAlive = true;
        }
        catch {
            processAlive = false;
        }
        if (!processAlive) {
            releaseGeneratedAppPort(projectId, port);
            persistGeneratedAppLifecycle(projectId, pid, {
                status: "failed",
                processAlive: false,
                portReachable: false,
                failedAt: new Date().toISOString(),
                checkedAt: new Date().toISOString(),
            });
            return;
        }
        const portCheck = await checkPort(port, "/");
        if (portCheck.reachable) {
            releaseGeneratedAppPort(projectId, port);
            persistGeneratedAppLifecycle(projectId, pid, {
                status: "running",
                processAlive: true,
                portReachable: true,
                portStatus: portCheck.status,
                portError: undefined,
                readyAt: new Date().toISOString(),
                checkedAt: new Date().toISOString(),
            });
            return;
        }
        await sleep(1000);
    }
    // A cold generated application may still be installing/building when the
    // GENERATED_APP_READINESS_PRESERVE_BUILD_PHASE
    // When the readiness window ends, preserve the current build phase
    // for a live child. A long build must not be mislabeled as application
    // startup, and a dead child is handled as a failure below.
    // readiness window ends. Preserve the active phase when the child is alive;
    // do not incorrectly convert a slow build into a failed deployment.
    let processAlive = false;
    try {
        process.kill(pid, 0);
        processAlive = true;
    }
    catch {
        processAlive = false;
    }
    if (!processAlive) {
        releaseGeneratedAppPort(projectId, port);
    }
    persistGeneratedAppLifecycle(projectId, pid, processAlive
        ? {
            status: getGeneratedAppManifest(projectId)?.status === "building"
                ? "building"
                : "starting",
            processAlive: true,
            portReachable: false,
            readinessTimedOut: true,
            checkedAt: new Date().toISOString(),
        }
        : {
            status: "failed",
            processAlive: false,
            portReachable: false,
            readinessTimedOut: true,
            failedAt: new Date().toISOString(),
            checkedAt: new Date().toISOString(),
        });
}
export async function prepareGeneratedApp(projectId) {
    const artifactDir = path.join(RUNTIME_ROOT, "data", "artifacts", projectId);
    const appDir = path.join(RUNTIME_ROOT, "generated-apps", projectId);
    // GENERATED_APP_DURABLE_RUNTIME_DATA
    // Mutable customer/application data must live outside the disposable
    // generated-app directory because prepareGeneratedApp rebuilds appDir.
    const runtimeDataDir = path.join(RUNTIME_ROOT, "data", "runtime-apps", projectId);
    fs.mkdirSync(runtimeDataDir, {
        recursive: true,
    });
    // GENERATED_APP_LEGACY_RUNTIME_MIGRATION
    // Older generated applications persisted mutable state inside
    // generated-apps/<projectId>/data/runtime. Preserve that state
    // before the disposable runnable directory is rebuilt.
    const legacyRuntimeDataDir = path.join(appDir, "data", "runtime");
    if (fs.existsSync(legacyRuntimeDataDir) &&
        !fs.lstatSync(legacyRuntimeDataDir).isSymbolicLink()) {
        copyDir(legacyRuntimeDataDir, runtimeDataDir);
    }
    if (!fs.existsSync(artifactDir)) {
        throw new Error(`Artifact folder not found for ${projectId}`);
    }
    fs.rmSync(appDir, { recursive: true, force: true });
    copyDir(artifactDir, appDir);
    // GENERATED_APP_RUNTIME_DATA_MOUNT
    // Keep the historical process.cwd()/data/runtime contract working
    // while storing the actual mutable files outside disposable appDir.
    const generatedDataDir = path.join(appDir, "data");
    const generatedRuntimeDataDir = path.join(generatedDataDir, "runtime");
    fs.mkdirSync(generatedDataDir, {
        recursive: true,
    });
    fs.rmSync(generatedRuntimeDataDir, {
        recursive: true,
        force: true,
    });
    fs.symlinkSync(runtimeDataDir, generatedRuntimeDataDir, "dir");
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
        fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n");
    }
    const port = await allocateGeneratedAppPort(projectId);
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
    fs.writeFileSync(path.join(manifestDir, `${projectId}.json`), JSON.stringify(manifest, null, 2));
    return manifest;
}
export async function startGeneratedApp(projectId) {
    // GENERATED_APP_SINGLE_START_GUARD
    // Never remove/rebuild the same runnable app while an earlier install,
    // build, or server process for that project is still alive.
    const existing = getGeneratedAppManifest(projectId);
    if (existing?.pid) {
        let processAlive = false;
        try {
            process.kill(Number(existing.pid), 0);
            processAlive = true;
        }
        catch {
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
    const reusableAppDir = existing?.appDir &&
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
    const child = spawn("bash", [
        "-lc",
        reusableAppDir
            ? `cd "${manifest.appDir}" && PORT=${manifest.port} npm run start`
            : `cd "${manifest.appDir}" && npm install && npm run build && PORT=${manifest.port} npm run start`,
    ], {
        detached: true,
        stdio: ["ignore", out, err],
        env: {
            ...process.env,
            OMEGACROWN_RUNTIME_DATA_DIR: manifest.runtimeDataDir,
        },
    });
    // GENERATED_APP_CHILD_TERMINAL_STATE
    //
    // Persist unexpected process termination while the sovereign runtime
    // remains online. Ownership checks prevent stale children from changing
    // the state of a newer restart.
    child.once("error", (error) => {
        releaseGeneratedAppPort(projectId, Number(manifest.port));
        persistGeneratedAppLifecycle(projectId, Number(child.pid || 0), {
            status: "failed",
            processAlive: false,
            portReachable: false,
            portStatus: undefined,
            failedAt: new Date().toISOString(),
            processError: String(error),
            checkedAt: new Date().toISOString(),
        });
    });
    child.once("exit", (code, signal) => {
        const current = getGeneratedAppManifest(projectId);
        if (Number(current?.pid || 0) !==
            Number(child.pid || 0)) {
            return;
        }
        if (current?.status === "stopped" ||
            current?.autoStopped === true) {
            return;
        }
        // GENERATED_APP_BUILD_FAILURE_CLASSIFICATION
        //
        // The process state stored immediately before exit tells us whether
        // a non-zero shell exit happened during the cold production build or
        // after the application had advanced into startup/runtime.
        const failedDuringBuild = current?.status === "building";
        // GENERATED_APP_BUILD_FAILURE_DIAGNOSTIC_WIRING
        //
        // A real cold-build failure must immediately enter the universal
        // diagnosis/repair ledger. This creates one authoritative repair
        // record per failed build process rather than leaving diagnosis
        // disconnected from the application lifecycle.
        let buildFailureRepair = null;
        if (code !== 0 &&
            failedDuringBuild) {
            const logs = getGeneratedAppLogs(projectId);
            const rawBuildLog = [
                logs.out,
                logs.err,
            ]
                .filter(Boolean)
                .join("\n");
            buildFailureRepair =
                recordGeneratedAppBuildFailure(projectId, rawBuildLog);
        }
        releaseGeneratedAppPort(projectId, Number(manifest.port));
        persistGeneratedAppLifecycle(projectId, Number(child.pid || 0), {
            status: code === 0
                ? "stopped"
                : "failed",
            ...(code !== 0
                ? {
                    buildFailed: failedDuringBuild,
                    failurePhase: failedDuringBuild
                        ? "build"
                        : "runtime",
                    failureReason: failedDuringBuild
                        ? "generated-production-build-failed"
                        : "generated-application-process-failed",
                    ...(failedDuringBuild &&
                        buildFailureRepair
                        ? {
                            repairAttempt: buildFailureRepair
                                .record
                                .attempt,
                            repairEligible: buildFailureRepair
                                .repairEligible,
                            repairAttemptsRemaining: buildFailureRepair
                                .attemptsRemaining,
                            buildDiagnostic: buildFailureRepair
                                .record
                                .diagnosis,
                        }
                        : {}),
                }
                : {}),
            processAlive: false,
            portReachable: false,
            portStatus: undefined,
            exitCode: code,
            exitSignal: signal,
            ...(code === 0
                ? {
                    stoppedAt: new Date().toISOString(),
                }
                : {
                    failedAt: new Date().toISOString(),
                }),
            checkedAt: new Date().toISOString(),
        });
    });
    child.unref();
    const now = Date.now();
    const expiresAt = new Date(now + GENERATED_PREVIEW_TTL_MS).toISOString();
    // GENERATED_APP_EXPLICIT_BUILD_PHASE
    //
    // Cold generated applications execute install -> build -> start.
    // Until a reusable production build exists, the authoritative state
    // is "building", not "starting".
    const running = {
        ...manifest,
        pid: child.pid,
        status: reusableAppDir
            ? "starting"
            : "building",
        watchdogPid: undefined,
        autoStopped: undefined,
        stoppedAt: undefined,
        portDown: undefined,
        startedAt: new Date(now).toISOString(),
        expiresAt,
        ttlSeconds: Math.round(GENERATED_PREVIEW_TTL_MS / 1000),
    };
    fs.writeFileSync(generatedAppManifestPath(projectId), JSON.stringify(running, null, 2));
    // GENERATED_APP_OWNERSHIP_GATED_TTL_WATCHDOG
    //
    // The TTL watchdog no longer performs its own port kill, PID kill,
    // or manifest mutation. After sleeping, it invokes the runtime-owned
    // cleanup helper in ttl-watchdog mode. The helper proves current
    // watchdog identity and application ownership before signaling.
    const watchdog = spawn("bash", [
        "-lc",
        [
            `sleep ${Math.ceil(GENERATED_PREVIEW_TTL_MS / 1000)}`,
            `cd ${JSON.stringify(RUNTIME_ROOT)}`,
            `node --input-type=module -e ${JSON.stringify([
                'import { cleanupExpiredGeneratedAppIfOwned } from "./dist/apps/generatedAppRunner.js";',
                `const projectId=${JSON.stringify(projectId)};`,
                'const invokingWatchdogPid=process.ppid;',
                'const result=await cleanupExpiredGeneratedAppIfOwned(projectId,{source:"ttl-watchdog",invokingWatchdogPid});',
                'if(!result || result.ok!==true) process.exit(1);'
            ].join(""))}`,
        ].join("; "),
    ], {
        detached: true,
        stdio: "ignore",
    });
    watchdog.unref();
    const runningWithWatchdog = {
        ...running,
        watchdogPid: watchdog.pid,
    };
    fs.writeFileSync(generatedAppManifestPath(projectId), JSON.stringify(runningWithWatchdog, null, 2));
    // GENERATED_APP_ASYNC_READINESS_RECONCILIATION
    //
    // Do not hold the deploy request open for a potentially long npm install
    // and production build. The API may return the explicit "starting" state,
    // while this monitor persists the authoritative transition to "running"
    // as soon as the generated server actually answers on its assigned port.
    void monitorGeneratedAppReadiness(projectId, Number(child.pid), Number(manifest.port)).catch(() => {
        releaseGeneratedAppPort(projectId, Number(manifest.port));
        persistGeneratedAppLifecycle(projectId, Number(child.pid), {
            status: "failed",
            processAlive: false,
            portReachable: false,
            failedAt: new Date().toISOString(),
            checkedAt: new Date().toISOString(),
        });
    });
    return runningWithWatchdog;
}
export function getGeneratedAppManifest(projectId) {
    const manifestPath = path.join(RUNTIME_ROOT, "data", "generated-apps", `${projectId}.json`);
    if (!fs.existsSync(manifestPath))
        return null;
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}
function readLinuxProcessIdentity(pid) {
    const dead = {
        alive: false,
        pid,
    };
    if (!Number.isInteger(pid) ||
        pid <= 1) {
        return dead;
    }
    const procDir = `/proc/${pid}`;
    if (!fs.existsSync(procDir)) {
        return dead;
    }
    let stat;
    try {
        stat = fs.readFileSync(path.join(procDir, "stat"), "utf8");
    }
    catch {
        return dead;
    }
    // Field 2 in /proc/<pid>/stat is "(comm)" and may contain spaces.
    // Everything following its final ")" begins with field 3 (state).
    const closeParen = stat.lastIndexOf(")");
    if (closeParen < 0) {
        return dead;
    }
    const fields = stat
        .slice(closeParen + 1)
        .trim()
        .split(/\s+/);
    // fields[0] = state  (field 3)
    // fields[1] = ppid   (field 4)
    // fields[2] = pgrp   (field 5)
    const parsedPpid = Number(fields[1]);
    const parsedPgid = Number(fields[2]);
    if (!Number.isInteger(parsedPpid) ||
        parsedPpid < 0 ||
        !Number.isInteger(parsedPgid) ||
        parsedPgid <= 0) {
        return dead;
    }
    let cwd;
    try {
        cwd = fs.readlinkSync(path.join(procDir, "cwd"));
    }
    catch {
        cwd = undefined;
    }
    let command;
    try {
        command =
            fs.readFileSync(path.join(procDir, "cmdline"))
                .toString("utf8")
                .split("\0")
                .filter(Boolean)
                .join(" ");
    }
    catch {
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
function readLinuxProcessAncestry(pid, maxDepth = 64) {
    const ancestry = [];
    const visited = new Set();
    let currentPid = pid;
    for (let depth = 0; depth < maxDepth; depth += 1) {
        if (!Number.isInteger(currentPid) ||
            currentPid <= 1 ||
            visited.has(currentPid)) {
            break;
        }
        visited.add(currentPid);
        const identity = readLinuxProcessIdentity(currentPid);
        if (!identity.alive ||
            !Number.isInteger(identity.ppid)) {
            break;
        }
        const parentPid = Number(identity.ppid);
        ancestry.push(parentPid);
        if (parentPid <= 1) {
            break;
        }
        currentPid = parentPid;
    }
    return ancestry;
}
function localAddressMatchesPort(localAddress, port) {
    const match = localAddress.match(/:(\d+)$/);
    return Boolean(match &&
        Number(match[1]) === port);
}
function findTcpListenerPids(port) {
    if (!Number.isInteger(port) ||
        port <= 0 ||
        port > 65535) {
        return [];
    }
    let output = "";
    try {
        output = String(execFileSync("ss", ["-ltnpH"], {
            encoding: "utf8",
            stdio: [
                "ignore",
                "pipe",
                "ignore",
            ],
        }));
    }
    catch {
        return [];
    }
    const pids = new Set();
    for (const line of output.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) {
            continue;
        }
        const columns = trimmed.split(/\s+/);
        // ss -ltnpH:
        // State Recv-Q Send-Q Local Peer Process
        const localAddress = columns[3] || "";
        if (!localAddressMatchesPort(localAddress, port)) {
            continue;
        }
        const pidPattern = /pid=(\d+)/g;
        let match;
        while ((match =
            pidPattern.exec(trimmed)) !== null) {
            const listenerPid = Number(match[1]);
            if (Number.isInteger(listenerPid) &&
                listenerPid > 1) {
                pids.add(listenerPid);
            }
        }
    }
    return Array.from(pids);
}
function commandReferencesNumber(command, value) {
    if (!command ||
        !Number.isInteger(value) ||
        value <= 0) {
        return false;
    }
    // value is already constrained to an integer, so no regex escaping is
    // required. Numeric boundaries prevent partial PID/port matches.
    const pattern = new RegExp("(^|\\D)" +
        String(value) +
        "(?!\\d)");
    return pattern.test(command);
}
export function classifyGeneratedAppOwnership(projectId) {
    const manifest = getGeneratedAppManifest(projectId);
    const manifestPid = Number(manifest?.pid ||
        0);
    const manifestPort = Number(manifest?.port ||
        0);
    const manifestAppDir = typeof manifest?.appDir ===
        "string"
        ? manifest.appDir
        : undefined;
    const watchdogPid = Number(manifest?.watchdogPid ||
        0);
    const processIdentity = readLinuxProcessIdentity(manifestPid);
    const listenerPids = findTcpListenerPids(manifestPort);
    const listenerCandidates = listenerPids.map((listenerPid) => {
        const identity = readLinuxProcessIdentity(listenerPid);
        const ancestry = readLinuxProcessAncestry(listenerPid);
        const cwdMatch = Boolean(identity.alive &&
            manifestAppDir &&
            identity.cwd ===
                manifestAppDir);
        const pgidMatch = Boolean(identity.alive &&
            Number.isInteger(identity.pgid) &&
            identity.pgid ===
                manifestPid);
        const ancestorMatch = ancestry.includes(manifestPid);
        return {
            pid: listenerPid,
            cwd: identity.cwd,
            pgid: identity.pgid,
            ancestry,
            cwdMatch,
            pgidMatch,
            ancestorMatch,
            ownsProcess: cwdMatch &&
                (pgidMatch ||
                    ancestorMatch),
        };
    });
    // If multiple PIDs are reported for the socket, prefer one satisfying
    // the ownership quorum. Otherwise preserve the first listener solely as
    // diagnostic evidence.
    const selectedListener = listenerCandidates.find((candidate) => candidate.ownsProcess) ||
        listenerCandidates[0];
    const listenerExists = listenerPids.length > 0;
    const listenerCwdMatch = selectedListener?.cwdMatch ===
        true;
    const listenerPgidMatch = selectedListener?.pgidMatch ===
        true;
    const listenerAncestorMatch = selectedListener?.ancestorMatch ===
        true;
    const processOwnership = Boolean(processIdentity.alive &&
        listenerExists &&
        listenerCwdMatch &&
        (listenerPgidMatch ||
            listenerAncestorMatch));
    const processOwnershipReasons = [];
    if (!manifest) {
        processOwnershipReasons.push("manifest-missing");
    }
    if (!Number.isInteger(manifestPid) ||
        manifestPid <= 1) {
        processOwnershipReasons.push("manifest-pid-invalid");
    }
    else if (!processIdentity.alive) {
        processOwnershipReasons.push("manifest-pid-not-alive");
    }
    if (!Number.isInteger(manifestPort) ||
        manifestPort <= 0 ||
        manifestPort > 65535) {
        processOwnershipReasons.push("manifest-port-invalid");
    }
    else if (!listenerExists) {
        processOwnershipReasons.push("port-listener-missing");
    }
    if (!manifestAppDir) {
        processOwnershipReasons.push("manifest-app-dir-missing");
    }
    else if (listenerExists &&
        !listenerCwdMatch) {
        processOwnershipReasons.push("listener-cwd-mismatch");
    }
    if (listenerExists &&
        listenerCwdMatch &&
        !listenerPgidMatch &&
        !listenerAncestorMatch) {
        processOwnershipReasons.push("listener-structural-relationship-unproven");
    }
    if (processOwnership &&
        processOwnershipReasons.length === 0) {
        processOwnershipReasons.push("process-ownership-proven");
    }
    const watchdogIdentity = readLinuxProcessIdentity(watchdogPid);
    const watchdogCommand = watchdogIdentity.command;
    const expectedManifestPath = generatedAppManifestPath(projectId);
    const watchdogProjectMatch = Boolean(watchdogIdentity.alive &&
        watchdogCommand &&
        watchdogCommand.includes(expectedManifestPath));
    const watchdogPidMatch = Boolean(watchdogIdentity.alive &&
        commandReferencesNumber(watchdogCommand, manifestPid));
    const watchdogPortMatch = Boolean(watchdogIdentity.alive &&
        commandReferencesNumber(watchdogCommand, manifestPort));
    const watchdogOwnership = Boolean(watchdogIdentity.alive &&
        watchdogProjectMatch &&
        watchdogPidMatch &&
        watchdogPortMatch);
    const watchdogOwnershipReasons = [];
    if (!Number.isInteger(watchdogPid) ||
        watchdogPid <= 1) {
        watchdogOwnershipReasons.push("watchdog-pid-invalid");
    }
    else if (!watchdogIdentity.alive) {
        watchdogOwnershipReasons.push("watchdog-not-alive");
    }
    if (watchdogIdentity.alive &&
        !watchdogProjectMatch) {
        watchdogOwnershipReasons.push("watchdog-project-mismatch");
    }
    if (watchdogIdentity.alive &&
        !watchdogPidMatch) {
        watchdogOwnershipReasons.push("watchdog-generated-pid-mismatch");
    }
    if (watchdogIdentity.alive &&
        !watchdogPortMatch) {
        watchdogOwnershipReasons.push("watchdog-port-mismatch");
    }
    if (watchdogOwnership &&
        watchdogOwnershipReasons.length === 0) {
        watchdogOwnershipReasons.push("watchdog-ownership-proven");
    }
    return {
        ok: manifest !== null,
        projectId,
        manifestPid: Number.isInteger(manifestPid) &&
            manifestPid > 1
            ? manifestPid
            : undefined,
        manifestPort: Number.isInteger(manifestPort) &&
            manifestPort > 0 &&
            manifestPort <= 65535
            ? manifestPort
            : undefined,
        manifestAppDir,
        pidAlive: processIdentity.alive,
        listenerExists,
        listenerPids,
        listenerPid: selectedListener?.pid,
        listenerCwd: selectedListener?.cwd,
        listenerCwdMatch,
        listenerPgid: selectedListener?.pgid,
        listenerPgidMatch,
        listenerAncestry: selectedListener
            ?.ancestry ||
            [],
        listenerAncestorMatch,
        processOwnership,
        processOwnershipReasons,
        watchdogPid: Number.isInteger(watchdogPid) &&
            watchdogPid > 1
            ? watchdogPid
            : undefined,
        watchdogAlive: watchdogIdentity.alive,
        watchdogCommand,
        watchdogProjectMatch,
        watchdogPidMatch,
        watchdogPortMatch,
        watchdogOwnership,
        watchdogOwnershipReasons,
    };
}
function signalOwnedProcessTerm(pid) {
    if (!Number.isInteger(pid) ||
        pid <= 1 ||
        pid === process.pid) {
        return false;
    }
    try {
        process.kill(-pid, "SIGTERM");
        return true;
    }
    catch {
        try {
            process.kill(pid, "SIGTERM");
            return true;
        }
        catch {
            return false;
        }
    }
}
export async function cleanupExpiredGeneratedAppIfOwned(projectId, options = {}) {
    const reasons = [];
    const manifest = getGeneratedAppManifest(projectId);
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
    const pid = Number(manifest?.pid ||
        0);
    const port = Number(manifest?.port ||
        0);
    const watchdogPid = Number(manifest?.watchdogPid ||
        0);
    const expiresAtMs = Date.parse(String(manifest?.expiresAt ||
        ""));
    const expired = Number.isFinite(expiresAtMs) &&
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
    const initialOwnership = classifyGeneratedAppOwnership(projectId);
    const invokedByTtlWatchdog = options.source === "ttl-watchdog";
    const invokingWatchdogPid = Number(options.invokingWatchdogPid ||
        0);
    if (invokedByTtlWatchdog) {
        if (!Number.isInteger(invokingWatchdogPid) ||
            invokingWatchdogPid <= 1) {
            reasons.push("ttl-watchdog-invoking-pid-invalid");
            return {
                ok: true,
                projectId,
                attempted: false,
                completed: false,
                deferred: true,
                processOwnership: initialOwnership.processOwnership,
                watchdogOwnership: initialOwnership.watchdogOwnership,
                watchdogSignalAttempted: false,
                processSignalAttempted: false,
                reasons,
            };
        }
        if (!initialOwnership.watchdogAlive ||
            !initialOwnership.watchdogOwnership ||
            Number(initialOwnership.watchdogPid ||
                0) !== invokingWatchdogPid) {
            reasons.push("ttl-watchdog-self-identity-unproven");
            persistGeneratedAppLifecycle(projectId, pid, {
                expirationCleanupDeferred: true,
                expirationCleanupAttemptedAt: new Date().toISOString(),
                processOwnership: initialOwnership.processOwnership,
                processOwnershipReasons: initialOwnership.processOwnershipReasons,
                watchdogOwnership: initialOwnership.watchdogOwnership,
                watchdogOwnershipReasons: initialOwnership.watchdogOwnershipReasons,
                expirationCleanupReasons: reasons,
            });
            return {
                ok: true,
                projectId,
                attempted: false,
                completed: false,
                deferred: true,
                processOwnership: initialOwnership.processOwnership,
                watchdogOwnership: initialOwnership.watchdogOwnership,
                watchdogSignalAttempted: false,
                processSignalAttempted: false,
                reasons,
            };
        }
    }
    if (initialOwnership.watchdogAlive &&
        !initialOwnership.watchdogOwnership) {
        reasons.push("live-watchdog-ownership-unproven");
        persistGeneratedAppLifecycle(projectId, pid, {
            expirationCleanupDeferred: true,
            expirationCleanupAttemptedAt: new Date().toISOString(),
            processOwnership: initialOwnership.processOwnership,
            processOwnershipReasons: initialOwnership.processOwnershipReasons,
            watchdogOwnership: initialOwnership.watchdogOwnership,
            watchdogOwnershipReasons: initialOwnership.watchdogOwnershipReasons,
            expirationCleanupReasons: reasons,
        });
        return {
            ok: true,
            projectId,
            attempted: false,
            completed: false,
            deferred: true,
            processOwnership: initialOwnership.processOwnership,
            watchdogOwnership: initialOwnership.watchdogOwnership,
            watchdogSignalAttempted: false,
            processSignalAttempted: false,
            reasons,
        };
    }
    if (!initialOwnership.processOwnership) {
        reasons.push(...initialOwnership
            .processOwnershipReasons);
        persistGeneratedAppLifecycle(projectId, pid, {
            expirationCleanupDeferred: true,
            expirationCleanupAttemptedAt: new Date().toISOString(),
            processOwnership: initialOwnership.processOwnership,
            processOwnershipReasons: initialOwnership.processOwnershipReasons,
            watchdogOwnership: initialOwnership.watchdogOwnership,
            watchdogOwnershipReasons: initialOwnership.watchdogOwnershipReasons,
            expirationCleanupReasons: reasons,
        });
        return {
            ok: true,
            projectId,
            attempted: false,
            completed: false,
            deferred: true,
            processOwnership: false,
            watchdogOwnership: initialOwnership.watchdogOwnership,
            watchdogSignalAttempted: false,
            processSignalAttempted: false,
            reasons,
        };
    }
    let watchdogSignalAttempted = false;
    if (!invokedByTtlWatchdog &&
        initialOwnership.watchdogAlive &&
        initialOwnership.watchdogOwnership) {
        // Reclassify immediately before signaling the watchdog.
        const watchdogRecheck = classifyGeneratedAppOwnership(projectId);
        if (!watchdogRecheck.watchdogAlive ||
            !watchdogRecheck.watchdogOwnership ||
            Number(watchdogRecheck.watchdogPid ||
                0) !== watchdogPid) {
            reasons.push("watchdog-revalidation-failed");
            persistGeneratedAppLifecycle(projectId, pid, {
                expirationCleanupDeferred: true,
                expirationCleanupAttemptedAt: new Date().toISOString(),
                expirationCleanupReasons: reasons,
            });
            return {
                ok: true,
                projectId,
                attempted: false,
                completed: false,
                deferred: true,
                processOwnership: watchdogRecheck.processOwnership,
                watchdogOwnership: watchdogRecheck.watchdogOwnership,
                watchdogSignalAttempted: false,
                processSignalAttempted: false,
                reasons,
            };
        }
        watchdogSignalAttempted =
            signalOwnedProcessTerm(watchdogPid);
        if (!watchdogSignalAttempted) {
            reasons.push("watchdog-sigterm-failed");
            persistGeneratedAppLifecycle(projectId, pid, {
                expirationCleanupDeferred: true,
                expirationCleanupAttemptedAt: new Date().toISOString(),
                expirationCleanupReasons: reasons,
            });
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
    const processRecheck = classifyGeneratedAppOwnership(projectId);
    if (!processRecheck.processOwnership ||
        Number(processRecheck.manifestPid ||
            0) !== pid) {
        reasons.push("process-revalidation-failed");
        reasons.push(...processRecheck
            .processOwnershipReasons);
        persistGeneratedAppLifecycle(projectId, pid, {
            expirationCleanupDeferred: true,
            expirationCleanupAttemptedAt: new Date().toISOString(),
            processOwnership: processRecheck.processOwnership,
            processOwnershipReasons: processRecheck.processOwnershipReasons,
            expirationCleanupReasons: reasons,
        });
        return {
            ok: true,
            projectId,
            attempted: watchdogSignalAttempted,
            completed: false,
            deferred: true,
            processOwnership: processRecheck.processOwnership,
            watchdogOwnership: processRecheck.watchdogOwnership,
            watchdogSignalAttempted,
            processSignalAttempted: false,
            reasons,
        };
    }
    const processSignalAttempted = signalOwnedProcessTerm(pid);
    if (!processSignalAttempted) {
        reasons.push("process-sigterm-failed");
        persistGeneratedAppLifecycle(projectId, pid, {
            expirationCleanupDeferred: true,
            expirationCleanupAttemptedAt: new Date().toISOString(),
            expirationCleanupReasons: reasons,
        });
        return {
            ok: true,
            projectId,
            attempted: true,
            completed: false,
            deferred: true,
            processOwnership: true,
            watchdogOwnership: initialOwnership.watchdogOwnership,
            watchdogSignalAttempted,
            processSignalAttempted: true,
            reasons,
        };
    }
    let portDown = {
        down: true,
        waitedMs: 0,
    };
    if (Number.isInteger(port) &&
        port > 0) {
        portDown =
            await waitForPortDown(port, 20000);
    }
    if (!portDown.down) {
        reasons.push("listener-still-up-after-sigterm");
        persistGeneratedAppLifecycle(projectId, pid, {
            expirationCleanupDeferred: true,
            expirationCleanupAttemptedAt: new Date().toISOString(),
            expirationCleanupReasons: reasons,
            portDown,
        });
        return {
            ok: true,
            projectId,
            attempted: true,
            completed: false,
            deferred: true,
            processOwnership: true,
            watchdogOwnership: initialOwnership.watchdogOwnership,
            watchdogSignalAttempted,
            processSignalAttempted: true,
            portDown,
            reasons,
        };
    }
    if (Number.isInteger(port) &&
        port > 0) {
        releaseGeneratedAppPort(projectId, port);
    }
    const stoppedAt = new Date().toISOString();
    persistGeneratedAppLifecycle(projectId, pid, {
        status: "stopped",
        processAlive: false,
        portReachable: false,
        portStatus: undefined,
        expired: true,
        expiredAt: manifest?.expiredAt ||
            stoppedAt,
        autoStopped: true,
        stoppedAt,
        expirationCleanupDeferred: false,
        expirationCleanupCompleted: true,
        expirationCleanupCompletedAt: stoppedAt,
        expirationCleanupMethod: "ownership-gated-sigterm",
        expirationCleanupReasons: [
            "ownership-proven",
            "sigterm-complete",
        ],
        portDown,
    });
    return {
        ok: true,
        projectId,
        attempted: true,
        completed: true,
        deferred: false,
        processOwnership: true,
        watchdogOwnership: initialOwnership.watchdogOwnership,
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
    const manifestDir = path.join(RUNTIME_ROOT, "data", "generated-apps");
    fs.mkdirSync(manifestDir, {
        recursive: true,
    });
    const files = fs.readdirSync(manifestDir)
        .filter((name) => /^OC-[A-Z0-9]+\.json$/i.test(name));
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
        const manifestPath = path.join(manifestDir, file);
        let manifest;
        try {
            manifest =
                JSON.parse(fs.readFileSync(manifestPath, "utf8"));
        }
        catch {
            summary.invalid += 1;
            continue;
        }
        const projectId = String(manifest?.projectId ||
            file.replace(/\.json$/i, ""));
        const status = String(manifest?.status ||
            "");
        if (status === "stopped" ||
            status === "failed" ||
            status === "stopping-timeout") {
            summary.skippedTerminal += 1;
            continue;
        }
        const pid = Number(manifest?.pid ||
            0);
        let processAlive = false;
        if (Number.isInteger(pid) &&
            pid > 1) {
            try {
                process.kill(pid, 0);
                processAlive = true;
            }
            catch {
                processAlive = false;
            }
        }
        const expiresAtMs = Date.parse(String(manifest?.expiresAt ||
            ""));
        const expired = Number.isFinite(expiresAtMs) &&
            expiresAtMs <= Date.now();
        if (expired &&
            !processAlive) {
            const checkedAt = new Date().toISOString();
            persistGeneratedAppLifecycle(projectId, pid, {
                status: "stopped",
                processAlive: false,
                portReachable: false,
                portStatus: undefined,
                autoStopped: true,
                expired: true,
                expiredAt: manifest?.expiredAt ||
                    checkedAt,
                stoppedAt: manifest?.stoppedAt ||
                    checkedAt,
                checkedAt,
                reconciledAtStartup: true,
            });
            if (manifest?.port) {
                releaseGeneratedAppPort(projectId, Number(manifest.port));
            }
            summary.expiredDead += 1;
            summary.reconciled += 1;
            continue;
        }
        if (expired &&
            processAlive) {
            // GENERATED_APP_STARTUP_OWNERSHIP_GATED_CLEANUP
            //
            // Stage 4.2E2 delegates destructive expiration cleanup to the
            // independently accepted helper. The helper reclassifies current
            // Linux ownership immediately before signaling and fails closed.
            const cleanup = await cleanupExpiredGeneratedAppIfOwned(projectId);
            persistGeneratedAppLifecycle(projectId, pid, {
                reconciledAtStartup: true,
                startupExpirationCleanupAttempted: cleanup.attempted,
                startupExpirationCleanupCompleted: cleanup.completed,
                startupExpirationCleanupDeferred: cleanup.deferred,
                startupExpirationCleanupReasons: cleanup.reasons,
                startupProcessOwnership: cleanup.processOwnership,
                startupWatchdogOwnership: cleanup.watchdogOwnership,
                checkedAt: new Date().toISOString(),
            });
            if (cleanup.completed) {
                summary.expiredDead += 1;
            }
            else {
                summary.liveExpiredDeferred += 1;
            }
            summary.reconciled += 1;
            continue;
        }
        // GENERATED_APP_STARTUP_BUILDING_RECONCILIATION
        //
        // Runtime restarts must reconcile children that were still installing
        // or building just as they reconcile starting/running applications.
        if (status === "building" ||
            status === "starting" ||
            status === "running" ||
            status === "prepared") {
            const reconciled = await getGeneratedAppStatus(projectId);
            if (reconciled?.ok === true) {
                persistGeneratedAppLifecycle(projectId, pid, {
                    reconciledAtStartup: true,
                    startupReconciledStatus: reconciled.status,
                    checkedAt: new Date().toISOString(),
                });
            }
            summary.staleActive += 1;
            summary.reconciled += 1;
        }
    }
    return summary;
}
export async function getGeneratedAppStatus(projectId) {
    const manifest = getGeneratedAppManifest(projectId);
    // GENERATED_APP_FAILED_STATUS_IS_TERMINAL
    //
    // A build/runtime failure is authoritative. Do not erase it merely
    // because the failed child is now dead and its port is unreachable.
    // This makes build failures visible to Preview and future repair logic.
    if (manifest?.status === "failed") {
        return {
            ok: true,
            ...manifest,
            status: "failed",
            processAlive: false,
            portReachable: false,
            checkedAt: new Date().toISOString(),
        };
    }
    if (!manifest?.pid) {
        return { ok: false, projectId, status: "not-running" };
    }
    let processAlive = false;
    try {
        process.kill(manifest.pid, 0);
        processAlive = true;
    }
    catch {
        processAlive = false;
    }
    const portCheck = manifest.port
        ? await checkPort(Number(manifest.port), "/")
        : { reachable: false, error: "Missing port" };
    const reconciledStatus = portCheck.reachable
        ? "running"
        : processAlive
            ? "starting"
            : "stopped";
    const checkedAt = new Date().toISOString();
    const reconciled = {
        ...manifest,
        status: reconciledStatus,
        processAlive,
        portReachable: portCheck.reachable,
        portStatus: portCheck.status,
        portError: portCheck.error,
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
    persistGeneratedAppLifecycle(projectId, Number(manifest.pid), reconciled);
    return {
        ok: true,
        ...reconciled,
    };
}
export async function stopGeneratedApp(projectId) {
    const manifest = getGeneratedAppManifest(projectId);
    if (!manifest?.pid) {
        return {
            ok: false,
            projectId,
            status: "not-running",
        };
    }
    const pid = Number(manifest.pid);
    const port = Number(manifest.port || 0);
    // GENERATED_APP_OWNERSHIP_GATED_EXPLICIT_STOP
    //
    // Persisted PID, port, processAlive, and earlier ownership evidence are
    // diagnostic claims only. Current Linux ownership is authoritative.
    //
    // Application and watchdog ownership are independent quorums.
    // No generic port kill and no SIGKILL escalation are permitted here.
    const initialOwnership = classifyGeneratedAppOwnership(projectId);
    const stopAttemptedAt = new Date().toISOString();
    if (!initialOwnership.processOwnership) {
        const deferred = {
            ...manifest,
            status: "stop-deferred",
            explicitStopAttempted: true,
            explicitStopCompleted: false,
            explicitStopDeferred: true,
            explicitStopAttemptedAt: stopAttemptedAt,
            processOwnership: false,
            processOwnershipReasons: initialOwnership.processOwnershipReasons,
            watchdogOwnership: initialOwnership.watchdogOwnership,
            watchdogOwnershipReasons: initialOwnership.watchdogOwnershipReasons,
            explicitStopReasons: initialOwnership.processOwnershipReasons,
            checkedAt: new Date().toISOString(),
        };
        fs.writeFileSync(generatedAppManifestPath(projectId), JSON.stringify(deferred, null, 2));
        return deferred;
    }
    // Watchdog authorization is independent from application authorization.
    if (initialOwnership.watchdogOwnership &&
        Number.isInteger(initialOwnership.watchdogPid) &&
        Number(initialOwnership.watchdogPid) > 1 &&
        Number(initialOwnership.watchdogPid) !== process.pid) {
        const watchdogRevalidation = classifyGeneratedAppOwnership(projectId);
        if (watchdogRevalidation
            .watchdogOwnership &&
            Number(watchdogRevalidation.watchdogPid) ===
                Number(initialOwnership.watchdogPid)) {
            signalOwnedProcessTerm(Number(watchdogRevalidation.watchdogPid));
        }
    }
    // Revalidate immediately before the destructive application signal.
    const processRevalidation = classifyGeneratedAppOwnership(projectId);
    if (!processRevalidation.processOwnership ||
        Number(processRevalidation.manifestPid ||
            0) !== pid) {
        const deferred = {
            ...manifest,
            status: "stop-deferred",
            explicitStopAttempted: true,
            explicitStopCompleted: false,
            explicitStopDeferred: true,
            explicitStopAttemptedAt: stopAttemptedAt,
            processOwnership: processRevalidation.processOwnership,
            processOwnershipReasons: processRevalidation.processOwnershipReasons,
            watchdogOwnership: processRevalidation.watchdogOwnership,
            watchdogOwnershipReasons: processRevalidation.watchdogOwnershipReasons,
            explicitStopReasons: [
                "process-ownership-revalidation-failed",
                ...processRevalidation
                    .processOwnershipReasons,
            ],
            checkedAt: new Date().toISOString(),
        };
        fs.writeFileSync(generatedAppManifestPath(projectId), JSON.stringify(deferred, null, 2));
        return deferred;
    }
    signalOwnedProcessTerm(pid);
    let portDown = {
        down: true,
        waitedMs: 0,
    };
    if (Number.isInteger(port) &&
        port > 0) {
        portDown =
            await waitForPortDown(port, 20000);
    }
    if (!portDown.down) {
        const timeoutOwnership = classifyGeneratedAppOwnership(projectId);
        const stoppingTimeout = {
            ...manifest,
            status: "stopping-timeout",
            explicitStopAttempted: true,
            explicitStopCompleted: false,
            explicitStopDeferred: true,
            explicitStopAttemptedAt: stopAttemptedAt,
            processOwnership: timeoutOwnership.processOwnership,
            processOwnershipReasons: timeoutOwnership.processOwnershipReasons,
            watchdogOwnership: timeoutOwnership.watchdogOwnership,
            watchdogOwnershipReasons: timeoutOwnership.watchdogOwnershipReasons,
            explicitStopReasons: [
                "sigterm-timeout",
                "automatic-sigkill-disabled",
                "generic-port-kill-disabled",
            ],
            portDown,
            checkedAt: new Date().toISOString(),
        };
        fs.writeFileSync(generatedAppManifestPath(projectId), JSON.stringify(stoppingTimeout, null, 2));
        return stoppingTimeout;
    }
    releaseGeneratedAppPort(projectId, port);
    const stopped = {
        ...manifest,
        status: "stopped",
        processAlive: false,
        portReachable: false,
        explicitStopAttempted: true,
        explicitStopCompleted: true,
        explicitStopDeferred: false,
        explicitStopAttemptedAt: stopAttemptedAt,
        explicitStopCompletedAt: new Date().toISOString(),
        explicitStopMethod: "ownership-gated-sigterm",
        explicitStopReasons: [
            "process-ownership-proven",
            "sigterm-complete",
        ],
        portDown,
        stoppedAt: new Date().toISOString(),
    };
    fs.writeFileSync(generatedAppManifestPath(projectId), JSON.stringify(stopped, null, 2));
    return stopped;
}
export async function restartGeneratedApp(projectId) {
    await stopGeneratedApp(projectId);
    return startGeneratedApp(projectId);
}
const GENERATED_APP_MAX_REPAIR_ATTEMPTS = 3;
function normalizeGeneratedBuildLog(value) {
    return String(value || "")
        .replace(/\r\n/g, "\n")
        .replace(/\u001b\[[0-9;]*m/g, "");
}
function extractGeneratedBuildEvidence(raw) {
    const text = normalizeGeneratedBuildLog(raw);
    const lines = text
        .split("\n")
        .map((line) => line.trimEnd())
        .filter(Boolean);
    return lines.slice(-120);
}
export function diagnoseGeneratedAppBuildFailure(rawLog) {
    const normalized = normalizeGeneratedBuildLog(rawLog);
    const evidence = extractGeneratedBuildEvidence(normalized);
    let category = "unknown";
    if (/Type error:|TS\d{4}:|Cannot find name|is not assignable to type|Property .* does not exist on type/i.test(normalized)) {
        category = "typescript";
    }
    else if (/Module not found|Cannot find module|Can't resolve/i.test(normalized)) {
        category = "module-resolution";
    }
    else if (/SyntaxError|Unexpected token|Parsing ecmascript source code failed|Expected .* got/i.test(normalized)) {
        category = "syntax";
    }
    else if (/prerender|Error occurred prerendering|Generating static pages/i.test(normalized)) {
        category = "prerender";
    }
    else if (/npm ERR!|ERESOLVE|peer dependency|dependency conflict/i.test(normalized)) {
        category = "dependency";
    }
    else if (/next\.config|Invalid next\.config|environment variable|Missing environment/i.test(normalized)) {
        category = "configuration";
    }
    let failingFile = null;
    let line = null;
    let column = null;
    const locationPatterns = [
        /(?:^|\n)\.\/([^:\n]+):(\d+):(\d+)/m,
        /(?:^|\n)(app\/[^:\n]+|src\/[^:\n]+|pages\/[^:\n]+):(\d+):(\d+)/m,
        /(?:^|\n)\.\/([^\n]+\.(?:tsx?|jsx?|mjs|cjs|css|json))(?::(\d+):(\d+))?/m,
    ];
    for (const pattern of locationPatterns) {
        const match = normalized.match(pattern);
        if (!match) {
            continue;
        }
        failingFile =
            String(match[1] || "")
                .replace(/^\.?\//, "")
                .trim() || null;
        if (match[2]) {
            line = Number(match[2]);
        }
        if (match[3]) {
            column = Number(match[3]);
        }
        break;
    }
    const messagePatterns = [
        /Type error:\s*([^\n]+)/i,
        /Module not found:\s*([^\n]+)/i,
        /SyntaxError:\s*([^\n]+)/i,
        /Failed to compile\.?\s*\n+([^\n]+)/i,
    ];
    let message = "Generated application production build failed.";
    for (const pattern of messagePatterns) {
        const match = normalized.match(pattern);
        if (match?.[1]) {
            message =
                match[1].trim();
            break;
        }
    }
    const repairEligible = category === "typescript" ||
        category === "module-resolution" ||
        category === "syntax" ||
        category === "prerender" ||
        category === "configuration";
    return {
        category,
        message,
        failingFile,
        line,
        column,
        evidence,
        repairEligible,
    };
}
function generatedAppRepairLedgerPath(projectId) {
    return path.join(RUNTIME_ROOT, "data", "runtime-apps", projectId, "repair-history.json");
}
export function getGeneratedAppRepairHistory(projectId) {
    const ledger = generatedAppRepairLedgerPath(projectId);
    if (!fs.existsSync(ledger)) {
        return [];
    }
    try {
        const parsed = JSON.parse(fs.readFileSync(ledger, "utf8"));
        return Array.isArray(parsed)
            ? parsed
            : [];
    }
    catch {
        return [];
    }
}
function persistGeneratedAppRepairHistory(projectId, history) {
    const ledger = generatedAppRepairLedgerPath(projectId);
    fs.mkdirSync(path.dirname(ledger), {
        recursive: true,
    });
    fs.writeFileSync(ledger, JSON.stringify(history, null, 2));
}
export function recordGeneratedAppBuildFailure(projectId, rawLog) {
    const history = getGeneratedAppRepairHistory(projectId);
    const diagnosis = diagnoseGeneratedAppBuildFailure(rawLog);
    const attempt = history.length + 1;
    const record = {
        attempt,
        createdAt: new Date().toISOString(),
        failurePhase: "build",
        diagnosis,
        repairApplied: false,
        repairResult: diagnosis.repairEligible &&
            attempt <=
                GENERATED_APP_MAX_REPAIR_ATTEMPTS
            ? "pending"
            : "skipped",
    };
    const nextHistory = [
        ...history,
        record,
    ];
    persistGeneratedAppRepairHistory(projectId, nextHistory);
    return {
        record,
        history: nextHistory,
        maxAttempts: GENERATED_APP_MAX_REPAIR_ATTEMPTS,
        attemptsRemaining: Math.max(0, GENERATED_APP_MAX_REPAIR_ATTEMPTS -
            attempt),
        repairEligible: record.repairResult === "pending",
    };
}
const GENERATED_APP_MAX_REPAIR_FILES = 12;
const GENERATED_APP_MAX_REPAIR_FILE_BYTES = 2 * 1024 * 1024;
function normalizeGeneratedRepairPath(value) {
    const normalized = String(value || "")
        .replace(/\\/g, "/")
        .replace(/^\.\/+/, "")
        .trim();
    if (!normalized) {
        throw new Error("Repair file path is empty.");
    }
    if (normalized.includes("\0") ||
        path.isAbsolute(normalized) ||
        normalized
            .split("/")
            .some((part) => part === ".." ||
            part === "")) {
        throw new Error(`Unsafe repair file path: ${normalized}`);
    }
    return normalized;
}
function resolveGeneratedRepairPath(rootDir, relativeFile) {
    const normalized = normalizeGeneratedRepairPath(relativeFile);
    const root = path.resolve(rootDir);
    const target = path.resolve(root, normalized);
    if (target !== root &&
        !target.startsWith(root + path.sep)) {
        throw new Error(`Repair path escaped generated project: ${normalized}`);
    }
    return {
        normalized,
        target,
    };
}
function atomicWriteGeneratedRepairFile(target, content) {
    fs.mkdirSync(path.dirname(target), {
        recursive: true,
    });
    const temporary = `${target}.omegacrown-repair-${process.pid}-${Date.now()}`;
    fs.writeFileSync(temporary, content, "utf8");
    fs.renameSync(temporary, target);
}
export function applyGeneratedAppRepairProposal(projectId, proposal) {
    const history = getGeneratedAppRepairHistory(projectId);
    const recordIndex = [...history]
        .map((record, index) => ({
        record,
        index,
    }))
        .reverse()
        .find(({ record }) => record.repairResult ===
        "pending" &&
        record.repairApplied === false)
        ?.index;
    if (typeof recordIndex !== "number") {
        throw new Error("No pending generated-app repair record exists.");
    }
    const record = history[recordIndex];
    if (!record.diagnosis
        .repairEligible) {
        throw new Error("Current build failure is not repair eligible.");
    }
    if (record.attempt >
        GENERATED_APP_MAX_REPAIR_ATTEMPTS) {
        throw new Error("Generated-app repair attempt limit exceeded.");
    }
    const provider = String(proposal?.provider || "").trim();
    if (!provider) {
        throw new Error("Repair proposal provider is required.");
    }
    const files = Array.isArray(proposal?.files)
        ? proposal.files
        : [];
    if (files.length < 1 ||
        files.length >
            GENERATED_APP_MAX_REPAIR_FILES) {
        throw new Error(`Repair proposal must contain 1-${GENERATED_APP_MAX_REPAIR_FILES} files.`);
    }
    const artifactDir = path.join(RUNTIME_ROOT, "data", "artifacts", projectId);
    if (!fs.existsSync(artifactDir)) {
        throw new Error(`Artifact folder not found for ${projectId}`);
    }
    const manifest = getGeneratedAppManifest(projectId);
    const appDir = String(manifest?.appDir ||
        path.join(RUNTIME_ROOT, "generated-apps", projectId));
    const runtimeDataDir = String(manifest?.runtimeDataDir ||
        path.join(RUNTIME_ROOT, "data", "runtime-apps", projectId));
    const backupRoot = path.join(runtimeDataDir, "repair-backups", `attempt-${record.attempt}`);
    const seen = new Set();
    const preparedFiles = files.map((item) => {
        const artifactTarget = resolveGeneratedRepairPath(artifactDir, item?.file);
        if (seen.has(artifactTarget.normalized)) {
            throw new Error(`Duplicate repair target: ${artifactTarget.normalized}`);
        }
        seen.add(artifactTarget.normalized);
        const content = String(item?.content ?? "");
        const bytes = Buffer.byteLength(content, "utf8");
        if (bytes >
            GENERATED_APP_MAX_REPAIR_FILE_BYTES) {
            throw new Error(`Repair file exceeds maximum size: ${artifactTarget.normalized}`);
        }
        const appTarget = resolveGeneratedRepairPath(appDir, artifactTarget.normalized);
        // GENERATED_APP_REPAIR_BACKUP_BUILD_ISOLATION
        //
        // Runtime repair state may be reachable from a generated project's
        // data/runtime path. Never preserve a source backup with a compilable
        // .ts/.tsx/.js/.jsx extension because Next.js/TypeScript can discover
        // and typecheck it during the repaired production build.
        //
        // Keep the original relative path for audit metadata while storing
        // the backup itself with a non-source suffix.
        const backupRelativeFile = `${artifactTarget.normalized}.omegacrown-backup`;
        const backupTarget = resolveGeneratedRepairPath(backupRoot, backupRelativeFile);
        return {
            relativeFile: artifactTarget.normalized,
            content,
            artifactTarget: artifactTarget.target,
            appTarget: appTarget.target,
            backupTarget: backupTarget.target,
            backupRelativeFile,
        };
    });
    // Complete all validation before mutating a project.
    for (const item of preparedFiles) {
        if (fs.existsSync(item.artifactTarget)) {
            atomicWriteGeneratedRepairFile(item.backupTarget, fs.readFileSync(item.artifactTarget, "utf8"));
        }
    }
    for (const item of preparedFiles) {
        // Artifact source is authoritative so future cold preparation does
        // not erase an accepted repair.
        atomicWriteGeneratedRepairFile(item.artifactTarget, item.content);
        // Keep an already prepared runnable copy synchronized.
        if (fs.existsSync(appDir)) {
            atomicWriteGeneratedRepairFile(item.appTarget, item.content);
        }
    }
    const updatedRecord = {
        ...record,
        repairApplied: true,
        repairResult: "applied",
        repairProvider: provider,
        repairSummary: String(proposal.summary || "").trim() || undefined,
        filesChanged: preparedFiles.map((item) => item.relativeFile),
        appliedAt: new Date().toISOString(),
    };
    history[recordIndex] =
        updatedRecord;
    persistGeneratedAppRepairHistory(projectId, history);
    const changedAt = new Date().toISOString();
    persistGeneratedAppLifecycle(projectId, Number(manifest?.pid || 0), {
        status: "repairing",
        repairAttempt: updatedRecord.attempt,
        repairProvider: provider,
        repairFiles: preparedFiles.map((item) => item.relativeFile),
        repairApplied: true,
        repairAppliedAt: changedAt,
        buildFailed: false,
        failurePhase: undefined,
        failureReason: undefined,
        failedAt: undefined,
        checkedAt: changedAt,
    });
    return {
        ok: true,
        projectId,
        attempt: updatedRecord.attempt,
        provider,
        filesChanged: preparedFiles.map((item) => item.relativeFile),
        backupRoot,
        repairResult: "applied",
    };
}
export function getGeneratedAppLogs(projectId) {
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
