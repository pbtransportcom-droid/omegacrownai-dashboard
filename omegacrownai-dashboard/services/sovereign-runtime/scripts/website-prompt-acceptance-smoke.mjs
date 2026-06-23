import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const repoRoot = path.resolve(process.cwd(), "../..");
const prompt = `Build a complete full-stack luxury transportation website and booking platform for Princess Benjamin Transportation Company serving Chicago O'Hare. Include homepage, fleet, airport transfer service pages, hourly chauffeur service, booking form, quote request API, admin dashboard for bookings, customer records, fleet management, dispatch view, pricing rules, Prisma database schema, seed data, email notification templates, validation report, missing-info report, README deployment instructions, Dockerfile, smoke tests, live preview, and downloadable ZIP package. Use the tagline "Your journey, our royal priority." Use a luxury black, gold, and royal style with professional transportation copy.`;

const payloadPath = "/tmp/omegacrownai-pbtc-acceptance-prompt.json";
fs.writeFileSync(payloadPath, JSON.stringify({ prompt }));

const responsePath = "/tmp/omegacrownai-pbtc-acceptance-response.json";
const curl = spawnSync("curl", [
  "-sS",
  "-m",
  "20",
  "-X",
  "POST",
  "https://www.omegacrownai.com/api/sovereign/build-website",
  "-H",
  "Content-Type: application/json",
  "--data-binary",
  `@${payloadPath}`
], { encoding: "utf8" });

if (curl.status !== 0) {
  console.error(curl.stderr || curl.stdout);
  process.exit(1);
}

fs.writeFileSync(responsePath, curl.stdout);
const response = JSON.parse(curl.stdout);
const projectId = response.projectId;

if (!response.ok || !projectId) {
  console.error(JSON.stringify(response, null, 2));
  throw new Error("Website builder did not return ok projectId.");
}

const artifactDir = path.join(repoRoot, "services/sovereign-runtime/data/artifacts", projectId);

for (let i = 0; i < 40; i++) {
  if (fs.existsSync(path.join(artifactDir, "index.html"))) break;
  await new Promise((resolve) => setTimeout(resolve, 3000));
}

if (!fs.existsSync(path.join(artifactDir, "index.html"))) {
  throw new Error(`Artifact index.html not found for ${projectId}`);
}

const requiredFiles = [
  "index.html",
  "README.md",
  "package.json",
  "Dockerfile",
  "prisma/schema.prisma",
  "prisma/seed.ts",
  "app/page.tsx",
  "app/admin/page.tsx",
  "app/admin/bookings/page.tsx",
  "app/admin/fleet/page.tsx",
  "app/admin/dispatch/page.tsx",
  "app/api/booking/route.ts",
  "app/api/bookings/route.ts",
  "app/api/quotes/route.ts",
  "app/api/fleet/route.ts",
  "app/api/dispatch/route.ts",
  "components/BookingForm.tsx",
  "components/Fleet.tsx",
  "data/fleet.json"
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(artifactDir, file)));

const grep = spawnSync("grep", [
  "-RIn",
  "Princess Benjamin\\|Your journey, our royal priority\\|O.Hare\\|O'Hare\\|O Hare\\|fleet\\|booking\\|dispatch\\|chauffeur\\|airport",
  artifactDir
], { encoding: "utf8" });

const contentMatchCount = (grep.stdout || "").split("\n").filter(Boolean).length;

let smokeOk = false;
let smokeOutput = "NO_SMOKE_SCRIPT_CHECKED";
const smokeTs = path.join(artifactDir, "scripts/smoke-test.ts");
const smokeMjs = path.join(artifactDir, "scripts/smoke-test.mjs");

if (fs.existsSync(smokeMjs)) {
  const smoke = spawnSync("node", [smokeMjs], { cwd: artifactDir, encoding: "utf8" });
  smokeOk = smoke.status === 0;
  smokeOutput = (smoke.stdout || smoke.stderr || "").trim();
} else if (fs.existsSync(smokeTs)) {
  const text = fs.readFileSync(smokeTs, "utf8");
  smokeOk = /Smoke tests passed|booking|fleet|dispatch|O Hare|O'Hare/i.test(text);
  smokeOutput = smokeOk ? "TypeScript smoke file contains expected checks." : "TypeScript smoke file missing expected checks.";
}

const preview = spawnSync("curl", [
  "-sS",
  "-o",
  "/dev/null",
  "-w",
  "%{http_code} %{content_type}",
  `https://www.omegacrownai.com/runtime-preview/${projectId}`
], { encoding: "utf8" });

const zipPath = `/tmp/${projectId}-acceptance.zip`;
const headerPath = `/tmp/${projectId}-acceptance-headers.txt`;
spawnSync("curl", [
  "-sS",
  "-D",
  headerPath,
  "-o",
  zipPath,
  `https://www.omegacrownai.com/api/projects/${projectId}/artifacts/index/download`
], { encoding: "utf8" });

const headers = fs.existsSync(headerPath) ? fs.readFileSync(headerPath, "utf8") : "";
const zip = fs.existsSync(zipPath) ? fs.readFileSync(zipPath) : Buffer.alloc(0);

const result = {
  projectId,
  missing,
  contentMatchCount,
  smokeOk,
  smokeOutput,
  previewStatus: preview.stdout.trim(),
  downloadStatus: headers.split(/\r?\n/).find((line) => line.startsWith("HTTP/")) || "NO_HTTP_STATUS",
  downloadContentTypeOk: /content-type:\s*application\/zip/i.test(headers),
  zipBytes: zip.length,
  zipSignatureOk: zip.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])),
  zipContainsProjectId: zip.includes(Buffer.from(projectId)),
  zipContainsReadme: zip.includes(Buffer.from("README.md")),
  zipContainsPackage: zip.includes(Buffer.from("package.json"))
};

console.log(JSON.stringify(result, null, 2));

const ok =
  missing.length === 0 &&
  contentMatchCount >= 8 &&
  smokeOk &&
  result.previewStatus.startsWith("200 ") &&
  result.downloadStatus.includes("200") &&
  result.downloadContentTypeOk &&
  result.zipBytes > 1000 &&
  result.zipSignatureOk &&
  result.zipContainsProjectId &&
  result.zipContainsReadme &&
  result.zipContainsPackage;

if (!ok) {
  console.error("WEBSITE_PROMPT_ACCEPTANCE_SMOKE_FAILED");
  process.exit(1);
}

console.log("WEBSITE_PROMPT_ACCEPTANCE_SMOKE_PASSED");
