#!/usr/bin/env node
import { writeFileSync } from "node:fs";

const projectId = process.argv[2];
if (!projectId) {
  console.error("Usage: npm run live-proof -- OC-PROJECTID");
  process.exit(1);
}

const dashboardBase = process.env.DASHBOARD_BASE || "http://127.0.0.1:3101";
const publicBase = process.env.PUBLIC_BASE || "https://omegacrownai.com";
const proofPath = process.env.PROOF_PATH || `/tmp/oc-live-proof-${projectId}.txt`;
const keepRunning = process.env.KEEP_APP_RUNNING === "1";

const startedAt = new Date().toISOString();
const checks = [];
let latestStatus = null;
let latestPublicUrl = "";

function writeProof(finalResult = "RUNNING", error = "") {
  const proof = [
    "OmegaCrownAI generated live app proof",
    "",
    `Project: ${projectId}`,
    `Public URL: ${latestPublicUrl || "pending"}`,
    `Started at: ${startedAt}`,
    `Updated at: ${new Date().toISOString()}`,
    `Final result: ${finalResult}`,
    "",
    "Checks:",
    ...checks.map((check) => `- ${check.ok ? "PASS" : "FAIL"} ${check.name}${check.detail ? `: ${check.detail}` : ""}`),
    "",
    latestStatus ? "Runtime:" : "",
    latestStatus ? JSON.stringify(latestStatus, null, 2) : "",
    error ? "" : "",
    error ? `Error: ${error}` : "",
    "",
  ].filter((line) => line !== "").join("\n");

  writeFileSync(proofPath, proof);
}

function record(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`${mark} ${name}${detail ? ` - ${detail}` : ""}`);
  writeProof("RUNNING");
}

async function requestJson(url, options = {}) {
  const signal = AbortSignal.timeout(Number(process.env.PROOF_TIMEOUT_MS || 30000));
  const res = await fetch(url, {
    ...options,
    signal,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { res, text, json };
}

async function requestText(url, options = {}) {
  const signal = AbortSignal.timeout(Number(process.env.PROOF_TIMEOUT_MS || 30000));
  const res = await fetch(url, { ...options, signal });
  const text = await res.text();
  return { res, text };
}

async function waitForRunning() {
  const statusUrl = `${dashboardBase}/api/runtime-proxy/runs/${projectId}/app-status`;

  for (let i = 0; i < 90; i += 1) {
    const { json } = await requestJson(statusUrl);
    if (json?.ok && json?.status === "running" && json?.portReachable === true) {
      return json;
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  const last = await requestJson(statusUrl);
  throw new Error(`Generated app did not become reachable. Last status: ${JSON.stringify(last.json)}`);
}

async function main() {
  const startUrl = `${dashboardBase}/api/runtime-proxy/runs/${projectId}/start-app`;
  const stopUrl = `${dashboardBase}/api/runtime-proxy/runs/${projectId}/stop-app`;

  const start = await requestJson(startUrl, { method: "POST", body: "{}" });
  record("Start app request", start.res.ok, `HTTP ${start.res.status}`);

  const status = await waitForRunning();
  latestStatus = status;
  record("Runtime status", true, `port ${status.port}, public path ${status.publicPath}`);

  const publicUrl = `${publicBase}${status.publicPath}`;
  const appBase = status.localUrl || `http://127.0.0.1:${status.port}`;
  latestPublicUrl = publicUrl;

  const page = await requestText(appBase);
  record("Public app page", page.res.ok && page.text.length > 500, `HTTP ${page.res.status}`);

  const fleet = await requestJson(`${appBase}/api/fleet`);
  const fleetNames = Array.isArray(fleet.json?.fleet)
    ? fleet.json.fleet.map((item) => item?.name).filter(Boolean)
    : [];
  record(
    "Fleet API",
    fleet.res.ok && fleet.json?.ok === true && fleetNames.length > 0,
    fleetNames.length ? fleetNames.join(", ") : `HTTP ${fleet.res.status}`
  );

  const quote = await requestJson(`${appBase}/api/quotes`, {
    method: "POST",
    body: JSON.stringify({
      name: "Live Proof Client",
      pickup: "O Hare Airport",
      dropoff: "Downtown Chicago",
      vehicleType: fleetNames[0] || "Executive Sedan",
      date: "2026-06-26",
      time: "10:00 AM",
    }),
  });
  record("Quote API", quote.res.ok && quote.json?.ok === true, quote.json?.quote?.id || `HTTP ${quote.res.status}`);

  const booking = await requestJson(`${appBase}/api/bookings`, {
    method: "POST",
    body: JSON.stringify({
      customerName: "Live Proof Client",
      pickup: "O Hare Airport",
      dropoff: "Downtown Chicago",
      vehicleType: fleetNames[0] || "Executive Sedan",
      date: "2026-06-26",
      time: "10:00 AM",
    }),
  });
  record("Booking API", booking.res.ok && booking.json?.ok === true, booking.json?.booking?.id || `HTTP ${booking.res.status}`);

  const hasUnsafeFleetName = fleetNames.some((name) => String(name).toLowerCase().includes("undefined"));
  record("No undefined fleet names", !hasUnsafeFleetName, fleetNames.join(", "));

  let stopped = null;
  if (!keepRunning) {
    stopped = await requestJson(stopUrl, { method: "POST", body: "{}" });
    record("Stop app after proof", stopped.res.ok, `HTTP ${stopped.res.status}`);
  } else {
    record("Keep app running", true, "KEEP_APP_RUNNING=1");
  }

  const ok = checks.every((check) => check.ok);
  writeProof(ok ? "PASS" : "FAIL");
  console.log(`Proof saved: ${proofPath}`);

  if (!ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  const message = error?.stack || error?.message || String(error);
  record("Live proof crashed", false, error?.message || String(error));
  writeProof("FAIL", message);
  console.error(`Proof saved: ${proofPath}`);
  process.exit(1);
});
