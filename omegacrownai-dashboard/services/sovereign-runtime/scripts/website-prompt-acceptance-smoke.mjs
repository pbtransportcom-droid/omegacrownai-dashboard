import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNTIME_ROOT = path.resolve(__dirname, "..");

const prompt = `Build a complete full-stack luxury transportation website and booking platform for Princess Benjamin Transportation Company serving Chicago O'Hare. Include homepage, fleet, airport transfer service pages, hourly chauffeur service, booking form, quote request API, admin dashboard for bookings, customer records, fleet management, dispatch view, pricing rules, Prisma database schema, seed data, email notification templates, validation report, missing-info report, README deployment instructions, Dockerfile, smoke tests, live preview, and downloadable ZIP package. Use the tagline "Your journey, our royal priority." Use a luxury black, gold, and royal style with professional transportation copy.`;

const requiredFiles = [
  "README.md",
  "Dockerfile",
  "prisma/seed.ts",
  "app/page.tsx",
  "app/admin/page.tsx",
  "app/admin/bookings/page.tsx",
  "app/admin/fleet/page.tsx",
  "app/admin/dispatch/page.tsx",
  "app/api/quotes/route.ts",
  "app/api/fleet/route.ts",
  "app/api/dispatch/route.ts",
  "data/fleet.json"
];

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { encoding: "utf8", ...options });
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
}

function jsonCurl(args) {
  return JSON.parse(run("curl", args));
}

function tryJsonCurl(args) {
  try {
    return jsonCurl(args);
  } catch {
    return null;
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function httpStatus(url) {
  return run("curl", ["-sS", "-o", "/tmp/website-prompt-response.tmp", "-w", "%{http_code} %{content_type}", url]).trim();
}

fs.writeFileSync("/tmp/website-prompt-acceptance.json", JSON.stringify({ prompt }));

const response = jsonCurl([
  "-sS",
  "-m",
  "20",
  "-X",
  "POST",
  "https://www.omegacrownai.com/api/sovereign/build-website",
  "-H",
  "Content-Type: application/json",
  "--data-binary",
  "@/tmp/website-prompt-acceptance.json"
]);

const projectId = response.projectId;
if (!projectId) throw new Error(`No projectId returned: ${JSON.stringify(response)}`);

const artifactDir = path.join(RUNTIME_ROOT, "data", "artifacts", projectId);

let summary = null;
let missing = requiredFiles;

for (let i = 0; i < 120; i++) {
  summary = tryJsonCurl(["-sS", `https://www.omegacrownai.com/api/runtime-proxy/runs/${projectId}/summary`]);
  missing = requiredFiles.filter((file) => !fs.existsSync(path.join(artifactDir, file)));

  if (missing.length === 0) break;

  const status = summary?.status || summary?.summary?.delivery || "waiting";
  process.stdout.write(`wait_website_fullstack ${i + 1} ${projectId} missing=${missing.length} status=${status}\n`);
  sleep(3000);
}

const allText = fs.existsSync(artifactDir)
  ? run("bash", ["-lc", `find ${JSON.stringify(artifactDir)} -maxdepth 5 -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.md' -o -name '*.html' \\) -print0 | xargs -0 cat 2>/dev/null || true`])
  : "";

const terms = [
  "Princess Benjamin Transportation Company",
  "O'Hare",
  "Your journey, our royal priority",
  "booking",
  "fleet",
  "dispatch",
  "quote"
];

const contentMatchCount = terms.reduce((count, term) => count + (allText.includes(term) ? 1 : 0), 0);

const smokePathTs = path.join(artifactDir, "scripts", "smoke-test.ts");
const smokePathMjs = path.join(artifactDir, "scripts", "smoke-test.mjs");
const smokeOk = fs.existsSync(smokePathTs) || fs.existsSync(smokePathMjs);

const previewStatus = httpStatus(`https://www.omegacrownai.com/runtime-preview/${projectId}`);

const zipPath = `/tmp/${projectId}-customer.zip`;
const downloadStatus = run("bash", [
  "-lc",
  `curl -sS -L -D /tmp/${projectId}-headers.txt -o ${zipPath} https://www.omegacrownai.com/api/projects/${projectId}/artifacts/index/download && head -1 /tmp/${projectId}-headers.txt`
]).trim();

const headers = fs.readFileSync(`/tmp/${projectId}-headers.txt`, "utf8");
const zip = fs.existsSync(zipPath) ? fs.readFileSync(zipPath) : Buffer.from("");

const result = {
  projectId,
  missing,
  contentMatchCount,
  smokeOk,
  smokeOutput: smokeOk ? "Smoke file exists." : "Smoke file missing.",
  previewStatus,
  downloadStatus,
  downloadContentTypeOk: /application\/zip/i.test(headers),
  zipBytes: zip.length,
  zipSignatureOk: zip.length >= 2 && zip[0] === 0x50 && zip[1] === 0x4b,
  zipContainsProjectId: zip.includes(Buffer.from(projectId)),
  zipContainsReadme: zip.includes(Buffer.from("README")),
  zipContainsPackage: zip.includes(Buffer.from("package.json"))
};

console.log(JSON.stringify(result, null, 2));

if (
  missing.length === 0 &&
  contentMatchCount >= 5 &&
  smokeOk &&
  previewStatus.startsWith("200 ") &&
  result.downloadStatus.includes("200") &&
  result.downloadContentTypeOk &&
  result.zipSignatureOk &&
  result.zipContainsReadme &&
  result.zipContainsPackage
) {
  console.log("WEBSITE_PROMPT_ACCEPTANCE_SMOKE_PASSED");
} else {
  console.error("WEBSITE_PROMPT_ACCEPTANCE_SMOKE_FAILED");
  throw new Error(JSON.stringify({ projectId, missing, summary }, null, 2));
}
