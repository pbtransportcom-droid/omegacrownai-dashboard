import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import http from "http";
const ROOT = process.cwd();
const RUNTIME_ROOT = path.join(ROOT, "services", "sovereign-runtime");
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
    for (const char of projectId)
        hash = (hash + char.charCodeAt(0)) % 500;
    return 5200 + hash;
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
export async function prepareGeneratedApp(projectId) {
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
    fs.writeFileSync(path.join(manifestDir, `${projectId}.json`), JSON.stringify(manifest, null, 2));
    return manifest;
}
export async function startGeneratedApp(projectId) {
    const manifest = await prepareGeneratedApp(projectId);
    const logDir = path.join(RUNTIME_ROOT, "logs", "generated-apps");
    fs.mkdirSync(logDir, { recursive: true });
    const out = fs.openSync(path.join(logDir, `${projectId}.out.log`), "a");
    const err = fs.openSync(path.join(logDir, `${projectId}.err.log`), "a");
    const child = spawn("bash", [
        "-lc",
        `cd "${manifest.appDir}" && npm install && npm run build && PORT=${manifest.port} npm run start`,
    ], {
        detached: true,
        stdio: ["ignore", out, err],
    });
    child.unref();
    const running = {
        ...manifest,
        pid: child.pid,
        status: "starting",
        startedAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(RUNTIME_ROOT, "data", "generated-apps", `${projectId}.json`), JSON.stringify(running, null, 2));
    return running;
}
export function getGeneratedAppManifest(projectId) {
    const manifestPath = path.join(RUNTIME_ROOT, "data", "generated-apps", `${projectId}.json`);
    if (!fs.existsSync(manifestPath))
        return null;
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}
export async function getGeneratedAppStatus(projectId) {
    const manifest = getGeneratedAppManifest(projectId);
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
        ? await checkPort(Number(manifest.port), "/api/content")
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
export function stopGeneratedApp(projectId) {
    const manifest = getGeneratedAppManifest(projectId);
    if (!manifest?.pid) {
        return { ok: false, projectId, status: "not-running" };
    }
    try {
        process.kill(manifest.pid, "SIGTERM");
    }
    catch { }
    const stopped = {
        ...manifest,
        status: "stopped",
        stoppedAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(RUNTIME_ROOT, "data", "generated-apps", `${projectId}.json`), JSON.stringify(stopped, null, 2));
    return stopped;
}
export async function restartGeneratedApp(projectId) {
    stopGeneratedApp(projectId);
    return startGeneratedApp(projectId);
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
