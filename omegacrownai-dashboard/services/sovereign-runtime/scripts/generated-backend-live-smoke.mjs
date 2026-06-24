import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNTIME_ROOT = path.resolve(__dirname, "..");

const prompt = `Build a complete full-stack luxury transportation website and booking platform for Princess Benjamin Transportation Company serving Chicago O'Hare. Include homepage, fleet, airport transfer service pages, hourly chauffeur service, booking form, quote request API, admin dashboard for bookings, customer records, fleet management, dispatch view, pricing rules, Prisma database schema, seed data, email notification templates, validation report, missing-info report, README deployment instructions, Dockerfile, smoke tests, live preview, and downloadable ZIP package. Use the tagline "Your journey, our royal priority." Use a luxury black, gold, and royal style with professional transportation copy.`;

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { encoding: "utf8", ...options });
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
}

function tryJsonCurl(args) {
  try {
    const raw = run("curl", args);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function jsonFromCurl(args) {
  const raw = run("curl", args);
  return JSON.parse(raw);
}

function httpStatus(url, method = "GET", body = null) {
  const args = ["-sS", "-o", "/tmp/generated-backend-live-response.tmp", "-w", "%{http_code} %{content_type}", "-X", method, url];
  if (body) args.push("-H", "Content-Type: application/json", "-d", JSON.stringify(body));
  return run("curl", args).trim();
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

fs.writeFileSync("/tmp/generated-backend-live-prompt.json", JSON.stringify({ prompt }));

const response = jsonFromCurl([
  "-sS",
  "-m",
  "20",
  "-X",
  "POST",
  "https://www.omegacrownai.com/api/sovereign/build-website",
  "-H",
  "Content-Type: application/json",
  "--data-binary",
  "@/tmp/generated-backend-live-prompt.json"
]);

const projectId = response.projectId;
if (!projectId) throw new Error("No projectId returned");

const packagePath = path.join(RUNTIME_ROOT, "data", "artifacts", projectId, "package.json");
const fleetServicePath = path.join(RUNTIME_ROOT, "data", "artifacts", projectId, "lib", "services", "fleet-service.ts");

let summary = null;
for (let i = 0; i < 100; i++) {
  summary = tryJsonCurl(["-sS", `https://www.omegacrownai.com/api/runtime-proxy/runs/${projectId}/summary`]);

  if (fs.existsSync(packagePath) && fs.existsSync(fleetServicePath)) break;

  const statusText = summary?.status || summary?.run?.status || summary?.delivery?.status || "waiting";
  process.stdout.write(`wait_artifact ${i + 1} ${projectId} ${statusText}\n`);
  sleep(3000);
}

if (!fs.existsSync(packagePath)) {
  throw new Error(`Missing package.json for ${projectId}. Last summary: ${JSON.stringify(summary, null, 2)}`);
}
if (!fs.existsSync(fleetServicePath)) {
  throw new Error(`Missing fleet service for ${projectId}. Last summary: ${JSON.stringify(summary, null, 2)}`);
}

const fleetService = fs.readFileSync(fleetServicePath, "utf8");
if (!fleetService.includes("listFleet")) {
  throw new Error("Generated fleet service is missing listFleet export");
}

try {
  jsonFromCurl(["-sS", "-X", "POST", `https://www.omegacrownai.com/api/runtime-proxy/runs/${projectId}/start-app`]);
} catch {
  process.stdout.write("start-app request timed out, continuing to poll app-status\n");
}

let status = null;
for (let i = 0; i < 100; i++) {
  status = jsonFromCurl(["-sS", `https://www.omegacrownai.com/api/runtime-proxy/runs/${projectId}/app-status`]);
  if (status.processAlive && status.portReachable && status.localUrl) break;
  process.stdout.write(`wait_app ${i + 1} ${projectId} ${status.status || "unknown"}\n`);
  sleep(5000);
}

if (!status?.processAlive || !status?.portReachable || !status?.localUrl) {
  const logs = jsonFromCurl(["-sS", `https://www.omegacrownai.com/api/runtime-proxy/runs/${projectId}/app-logs`]);
  throw new Error(`Generated app did not start\n${JSON.stringify(status, null, 2)}\n${JSON.stringify(logs, null, 2)}`);
}

const appUrl = status.localUrl;
const checks = {
  home: httpStatus(appUrl),
  admin: httpStatus(`${appUrl}/admin`),
  customer: httpStatus(`${appUrl}/customer`),
  dispatcher: httpStatus(`${appUrl}/dispatcher`),
  fleet: httpStatus(`${appUrl}/api/fleet`)
};

for (const [key, value] of Object.entries(checks)) {
  if (!value.startsWith("200 ")) throw new Error(`${key} failed: ${value}`);
}

const quoteStatus = httpStatus(`${appUrl}/api/quotes`, "POST", {
  pickup: "O Hare Airport",
  dropoff: "Downtown Chicago",
  vehicleType: "SUV",
  hours: 2
});
if (!quoteStatus.startsWith("200 ")) throw new Error(`quote failed: ${quoteStatus}`);
const quotePayload = JSON.parse(fs.readFileSync("/tmp/generated-backend-live-response.tmp", "utf8"));
if (!quotePayload.ok) throw new Error(`quote payload not ok: ${JSON.stringify(quotePayload)}`);

const bookingStatus = httpStatus(`${appUrl}/api/bookings`, "POST", {
  name: "Test Customer",
  email: "test@example.com",
  phone: "7735101467",
  pickup: "O Hare Airport",
  dropoff: "Downtown Chicago",
  vehicleType: "SUV",
  date: "2026-06-24",
  time: "10:00 AM"
});
if (!bookingStatus.startsWith("200 ")) throw new Error(`booking failed: ${bookingStatus}`);
const bookingPayload = JSON.parse(fs.readFileSync("/tmp/generated-backend-live-response.tmp", "utf8"));
if (!bookingPayload.ok) throw new Error(`booking payload not ok: ${JSON.stringify(bookingPayload)}`);

console.log(JSON.stringify({ projectId, appUrl, checks, quoteOk: quotePayload.ok, bookingOk: bookingPayload.ok }, null, 2));
console.log("GENERATED_BACKEND_LIVE_SMOKE_PASSED");
