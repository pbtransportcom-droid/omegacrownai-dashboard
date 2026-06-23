import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { buildArtifacts } from "../dist/artifacts/builder.js";

const root = process.cwd();
const stamp = Date.now();
const projectId = `OC-QA-DOWNLOAD-${stamp}`;
const prompt = "Build a complete full-stack ecommerce website called Orange Shop for selling fresh oranges, citrus packs, juices, gift baskets, subscriptions, product catalog, cart, checkout, admin orders, database schema, API routes, generated product images, asset manifest, README, Dockerfile, and smoke tests.";

const run = {
  projectId,
  prompt,
  mode: "artifacts",
  status: "artifacts",
  artifacts: [],
  validation: null
};

await buildArtifacts(run);

const outDir = path.join(root, "data", "artifacts", projectId);
const smoke = ["scripts/fullstack-smoke.mjs", "scripts/smoke-test.mjs"]
  .find((file) => fs.existsSync(path.join(outDir, file)));

let smokeOk = false;
let smokeOutput = "NO_SMOKE_SCRIPT";
if (smoke) {
  const result = spawnSync("node", [smoke], { cwd: outDir, encoding: "utf8" });
  smokeOk = result.status === 0;
  smokeOutput = (result.stdout || result.stderr || "").trim();
}

const downloadUrl = `https://www.omegacrownai.com/api/projects/${projectId}/artifacts/index/download`;
const zipPath = `/tmp/${projectId}-download.zip`;
const headerPath = `/tmp/${projectId}-download-headers.txt`;

let downloadStatus = "SKIPPED";
let contentTypeOk = false;
let dispositionOk = false;
let redactedOk = false;
let zipBytes = 0;
let zipSignatureOk = false;
let zipContainsReadme = false;
let zipContainsPackage = false;
let zipContainsProjectId = false;

if (process.env.LIVE_CHECK === "1") {
  const curl = spawnSync("curl", [
    "-sS",
    "-D",
    headerPath,
    "-o",
    zipPath,
    downloadUrl
  ], { encoding: "utf8" });

  if (curl.status !== 0) {
    console.error(curl.stderr || curl.stdout);
  }

  const headers = fs.existsSync(headerPath) ? fs.readFileSync(headerPath, "utf8") : "";
  const zip = fs.existsSync(zipPath) ? fs.readFileSync(zipPath) : Buffer.alloc(0);

  downloadStatus = headers.split(/\r?\n/).find((line) => line.startsWith("HTTP/")) || "NO_HTTP_STATUS";
  contentTypeOk = /content-type:\s*application\/zip/i.test(headers);
  dispositionOk = /content-disposition:\s*attachment/i.test(headers);
  redactedOk = /x-omegacrownai-redacted:\s*true/i.test(headers);
  zipBytes = zip.length;
  zipSignatureOk = zip.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  const zipText = zip.toString("utf8");
  zipContainsReadme = zipText.includes("README.md");
  zipContainsPackage = zipText.includes("package.json");
  zipContainsProjectId = zipText.includes(projectId);
}

const result = {
  projectId,
  smokeFile: smoke || "NONE",
  smokeOk,
  smokeOutput,
  downloadUrl,
  downloadStatus,
  contentTypeOk,
  dispositionOk,
  redactedOk,
  zipBytes,
  zipSignatureOk,
  zipContainsReadme,
  zipContainsPackage,
  zipContainsProjectId
};

console.log(JSON.stringify(result, null, 2));

const liveOk = process.env.LIVE_CHECK !== "1" || (
  downloadStatus.includes("200") &&
  contentTypeOk &&
  dispositionOk &&
  redactedOk &&
  zipBytes > 1000 &&
  zipSignatureOk &&
  zipContainsReadme &&
  zipContainsPackage &&
  zipContainsProjectId
);

if (!smokeOk || !liveOk) {
  console.error("ARTIFACT_DOWNLOAD_ROUTE_SMOKE_FAILED");
  process.exit(1);
}

console.log("ARTIFACT_DOWNLOAD_ROUTE_SMOKE_PASSED");
