import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { buildArtifacts } from "../dist/artifacts/builder.js";
import { validateGeneratedArtifacts } from "../dist/artifacts/generated-artifact-validator.js";

const root = process.cwd();

async function runCase({ key, projectId, prompt, validate = false, assetPath }) {
  const run = {
    projectId,
    prompt,
    mode: "artifacts",
    status: "artifacts",
    artifacts: [],
    validation: null
  };

  const artifacts = await buildArtifacts(run);
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

  let validationOk = true;
  let validationErrors = 0;
  if (validate) {
    const validationResult = validateGeneratedArtifacts(artifacts);
    validationOk = Boolean(validationResult.ok);
    validationErrors = validationResult.errors?.length || 0;
  }

  const previewUrl = `https://www.omegacrownai.com/runtime-preview/${projectId}`;
  let previewStatus = "SKIPPED";
  let assetStatus = "SKIPPED";

  if (process.env.LIVE_CHECK === "1") {
    const preview = spawnSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code} %{content_type}", previewUrl], { encoding: "utf8" });
    previewStatus = preview.stdout.trim();

    if (assetPath) {
      const asset = spawnSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code} %{content_type}", `${previewUrl}/${assetPath}`], { encoding: "utf8" });
      assetStatus = asset.stdout.trim();
    }
  }

  return {
    key,
    projectId,
    validationOk,
    validationErrors,
    smokeFile: smoke || "NONE",
    smokeOk,
    smokeOutput,
    previewUrl,
    previewStatus,
    assetStatus
  };
}

const stamp = Date.now();

const results = [];
results.push(await runCase({
  key: "universal-orange",
  projectId: `OC-QA-LIVEUNI-${stamp}`,
  prompt: "Build a complete full-stack ecommerce website called Orange Shop for selling fresh oranges, citrus packs, juices, gift baskets, subscriptions, product catalog, cart, checkout, admin orders, database schema, API routes, generated product images, asset manifest, README, Dockerfile, and smoke tests.",
  assetPath: "public/images/commerce-hero.svg"
}));

results.push(await runCase({
  key: "finance",
  projectId: `OC-QA-LIVEFIN-${stamp}`,
  prompt: "Build a full-stack production personal finance web app called FastLedger with dashboard KPIs, income and expense CRUD, category analytics, settings, CSV JSON import export, Prisma database persistence, seed data, env example, API routes, admin page, editor page, Dockerfile, README deployment instructions, and smoke tests.",
  validate: true
}));

console.log(JSON.stringify(results, null, 2));

const failed = results.filter((result) => {
  const previewOk = process.env.LIVE_CHECK === "1" ? result.previewStatus.startsWith("200 ") : true;
  const assetOk = process.env.LIVE_CHECK === "1" && result.assetStatus !== "SKIPPED" ? result.assetStatus.startsWith("200 ") : true;
  return !result.validationOk || result.validationErrors !== 0 || !result.smokeOk || !previewOk || !assetOk;
});

if (failed.length) {
  console.error("ARTIFACT_LIVE_FAST_SMOKE_FAILED");
  process.exit(1);
}

console.log("ARTIFACT_LIVE_FAST_SMOKE_PASSED");
