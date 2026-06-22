import fs from "fs";
import path from "path";
import { buildArtifacts } from "../dist/artifacts/builder.js";
import { validateGeneratedArtifacts } from "../dist/artifacts/generated-artifact-validator.js";

const prompts = [
  {
    key: "finance",
    projectId: `OC-QA-FINANCE-${Date.now()}`,
    prompt: "Build a full-stack production personal finance web app called MatrixLedger with dashboard KPIs, income and expense CRUD, category analytics, settings, CSV JSON import export, Prisma database persistence, seed data, env example, API routes, admin page, editor page, Dockerfile, README deployment instructions, and smoke tests."
  },
  {
    key: "orange-shop",
    projectId: `OC-QA-ORANGE-${Date.now()}`,
    prompt: "Build a complete full-stack ecommerce website called Orange Shop for selling fresh oranges, citrus packs, juices, gift baskets, subscriptions, product catalog, cart, checkout, admin orders, database schema, API routes, generated product images, asset manifest, README, Dockerfile, and smoke tests."
  },
  {
    key: "transport",
    projectId: `OC-QA-TRANSPORT-${Date.now()}`,
    prompt: "Build a production transportation booking website for Princess Benjamin Transportation Company with O'Hare airport transfers, fleet gallery, quote request, booking form, dispatch admin, generated visuals, asset manifest, README, Dockerfile, and smoke tests."
  },
  {
    key: "legal",
    projectId: `OC-QA-LEGAL-${Date.now()}`,
    prompt: "Build a production legal firm website called Crown Legal Partners with consultation intake, practice areas, attorney profiles, case review workflow, admin dashboard, generated visuals, asset manifest, README, Dockerfile, and smoke tests."
  },
  {
    key: "saas",
    projectId: `OC-QA-SAAS-${Date.now()}`,
    prompt: "Build a production SaaS landing website called CrownOps with product workflow, pricing, testimonials, analytics visuals, admin console, generated visuals, asset manifest, README, Dockerfile, and smoke tests."
  },
  {
    key: "fitness",
    projectId: `OC-QA-FITNESS-${Date.now()}`,
    prompt: "Build a production fitness studio website called CrownFit with class schedule, trainer profiles, membership signup, admin dashboard, generated visuals, asset manifest, README, Dockerfile, and smoke tests."
  },
  {
    key: "bookstore",
    projectId: `OC-QA-BOOKSTORE-${Date.now()}`,
    prompt: "Build a complete bookstore commerce website called Crown Books with product catalog, authors, bundles, audiobook products, cart, checkout, admin orders, generated book images, asset manifest, README, Dockerfile, and smoke tests."
  }
];

function localAssetRefs(html) {
  return Array.from(html.matchAll(/(?:src|href)=["']([^"']+\.(?:svg|png|jpg|jpeg|webp|gif|json|css|js))["']/gi)).map((match) => match[1]);
}

function normalizeRef(ref) {
  return ref
    .replace(/^\/runtime-preview\/[^/]+\//, "")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");
}

async function checkLive(url) {
  try {
    const response = await fetch(url, { method: "GET" });
    return `${response.status} ${response.headers.get("content-type") || ""}`;
  } catch (error) {
    return `FETCH_ERROR ${error.message}`;
  }
}

let failed = false;
const summary = [];

for (const item of prompts) {
  const run = {
    projectId: item.projectId,
    prompt: item.prompt,
    mode: "artifacts",
    status: "artifacts",
    artifacts: [],
    validation: null
  };

  const artifacts = await buildArtifacts(run);
  const validation = validateGeneratedArtifacts(artifacts);
  const outDir = path.join(process.cwd(), "data", "artifacts", run.projectId);
  const htmlPath = path.join(outDir, "index.html");
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : "";
  const refs = localAssetRefs(html);

  const missingRefs = [];
  for (const ref of refs) {
    if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:")) continue;
    const normalized = normalizeRef(ref);
    if (!fs.existsSync(path.join(outDir, normalized))) {
      missingRefs.push(`${ref} -> ${normalized}`);
    }
  }

  const smokeCandidates = ["scripts/fullstack-smoke.mjs", "scripts/smoke-test.mjs"];
  const runnableSmoke = smokeCandidates.find((file) => fs.existsSync(path.join(outDir, file)));
  let smokeOk = true;
  let smokeOutput = "NO_SMOKE_SCRIPT";
  if (runnableSmoke) {
    const { spawnSync } = await import("child_process");
    const result = spawnSync("node", [runnableSmoke], { cwd: outDir, encoding: "utf8" });
    smokeOk = result.status === 0;
    smokeOutput = (result.stdout || result.stderr || "").trim();
  }

  const previewUrl = `https://www.omegacrownai.com/runtime-preview/${run.projectId}`;
  const livePreview = process.env.LIVE_MATRIX === "1" ? await checkLive(previewUrl) : "SKIPPED";
  const liveAssets = [];
  if (process.env.LIVE_MATRIX === "1") {
    for (const ref of refs.filter((ref) => /\.(svg|png|jpg|jpeg|webp|gif)$/i.test(ref)).slice(0, 4)) {
      const liveUrl = ref.startsWith("/runtime-preview/")
        ? `https://www.omegacrownai.com${ref}`
        : `${previewUrl}/${normalizeRef(ref)}`;
      liveAssets.push([liveUrl, await checkLive(liveUrl)]);
    }
  }

  const ok = validation.ok && missingRefs.length === 0 && smokeOk && (!process.env.LIVE_MATRIX || livePreview.startsWith("200 "));
  if (!ok) failed = true;

  summary.push({
    key: item.key,
    projectId: run.projectId,
    artifactCount: artifacts.length,
    validationOk: validation.ok,
    validationErrors: validation.errors?.length || 0,
    missingRefs,
    smokeOk,
    smokeOutput,
    previewUrl,
    livePreview,
    liveAssets
  });
}

console.log(JSON.stringify(summary, null, 2));

if (failed) {
  throw new Error("Artifact matrix smoke failed");
}

console.log("ARTIFACT_MATRIX_SMOKE_PASSED");
