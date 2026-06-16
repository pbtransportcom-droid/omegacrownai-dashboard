import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

type ValidationResult = {
  label: string;
  path?: string;
  exists?: boolean;
  size?: number;
  ok: boolean;
  details?: string;
  matched?: string[];
};

function firstExisting(candidates: string[]) {
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function readIfExists(file: string) {
  try {
    return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  } catch {
    return "";
  }
}

function checkPath(label: string, candidates: string[]): ValidationResult {
  const file = firstExisting(candidates);
  const exists = fs.existsSync(file);
  const stat = exists ? fs.statSync(file) : null;

  return {
    label,
    path: file,
    exists,
    size: stat ? stat.size : 0,
    ok: Boolean(stat && (stat.isDirectory() || stat.size > 0)),
  };
}

function checkContent(label: string, file: string, required: string[]): ValidationResult {
  const content = readIfExists(file);
  const matched = required.filter((needle) => content.includes(needle));

  return {
    label,
    path: file,
    exists: fs.existsSync(file),
    size: content.length,
    ok: required.length > 0 && matched.length === required.length,
    matched,
    details: `${matched.length}/${required.length} required markers found`,
  };
}

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(full);
    return [full];
  });
}

function relativeMatches(root: string, files: string[], patterns: RegExp[]) {
  const rels = files.map((file) => path.relative(root, file).replace(/\\/g, "/"));
  return patterns.map((pattern) => rels.find((rel) => pattern.test(rel))).filter(Boolean) as string[];
}

function checkFilePatterns(label: string, root: string, files: string[], patterns: RegExp[]): ValidationResult {
  const matched = relativeMatches(root, files, patterns);

  return {
    label,
    path: root,
    exists: fs.existsSync(root),
    ok: matched.length === patterns.length,
    matched,
    details: `${matched.length}/${patterns.length} required file patterns found`,
  };
}

function checkPrismaModels(schemaFile: string): ValidationResult {
  const content = readIfExists(schemaFile);
  const models = [...content.matchAll(/^model\s+([A-Za-z0-9_]+)/gm)].map((match) => match[1]);

  return {
    label: "Database Prisma models",
    path: schemaFile,
    exists: fs.existsSync(schemaFile),
    size: content.length,
    ok: content.includes("datasource db") && content.includes("DATABASE_URL") && models.length >= 1,
    matched: models,
    details: `${models.length} model(s) found`,
  };
}

function checkPackageScripts(packageFile: string): ValidationResult {
  let pkg: any = null;

  try {
    pkg = JSON.parse(readIfExists(packageFile));
  } catch {}

  const scripts = pkg?.scripts || {};
  const deps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };
  const required = [
    scripts.build && String(scripts.build).includes("next build"),
    scripts.start && String(scripts.start).includes("next start"),
    scripts.postinstall && String(scripts.postinstall).includes("prisma generate"),
    scripts["db:generate"] && String(scripts["db:generate"]).includes("prisma generate"),
    deps.prisma,
    deps["@prisma/client"],
  ];

  return {
    label: "Package database/build scripts",
    path: packageFile,
    exists: fs.existsSync(packageFile),
    size: readIfExists(packageFile).length,
    ok: required.every(Boolean),
    matched: Object.keys(scripts),
    details: `${required.filter(Boolean).length}/${required.length} script/dependency checks passed`,
  };
}

function checkApiReadiness(root: string, files: string[]): ValidationResult {
  const apiRoutes = relativeMatches(root, files, [/^app\/api\/.+\/route\.ts$/]);
  const storeFiles = relativeMatches(root, files, [/^lib\/.+store\.ts$/]);
  const dataFiles = relativeMatches(root, files, [/^data\/.+\.json$/]);

  return {
    label: "API/store/data readiness",
    path: root,
    exists: fs.existsSync(root),
    ok: apiRoutes.length >= 1 && storeFiles.length >= 1 && dataFiles.length >= 1,
    matched: [...apiRoutes.slice(0, 8), ...storeFiles.slice(0, 8), ...dataFiles.slice(0, 8)],
    details: `${apiRoutes.length} API route(s), ${storeFiles.length} store file(s), ${dataFiles.length} data file(s)`,
  };
}

function checkReadmeDelivery(readmeFile: string): ValidationResult {
  const content = readIfExists(readmeFile).toLowerCase();
  const markers = ["local setup", "npm install", "npm run build"];
  const matched = markers.filter((marker) => content.includes(marker));

  return {
    label: "README setup instructions",
    path: readmeFile,
    exists: fs.existsSync(readmeFile),
    size: content.length,
    ok: matched.length === markers.length,
    matched,
    details: `${matched.length}/${markers.length} setup markers found`,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const root = process.cwd();

  const artifactDir = path.join(root, "services", "sovereign-runtime", "data", "artifacts", projectId);
  const files = walkFiles(artifactDir);

  const prismaFile = path.join(artifactDir, "prisma", "schema.prisma");
  const packageFile = path.join(artifactDir, "package.json");
  const envFile = path.join(artifactDir, ".env.example");
  const readmeFile = path.join(artifactDir, "README.md");

  const results: ValidationResult[] = [
    checkPath("Runtime metadata", [
      path.join(root, "services", "sovereign-runtime", "data", "artifacts", projectId, "metadata.json"),
      path.join(root, "data", "generated-artifacts", projectId, "metadata.json"),
    ]),
    checkPath("Runtime HTML preview", [
      path.join(root, "services", "sovereign-runtime", "data", "artifacts", projectId, "index.html"),
      path.join(root, "public", "runtime-deployments", projectId, "index.html"),
      path.join(root, "data", "generated-artifacts", projectId, "index.html"),
    ]),
    checkPath("Runtime stylesheet", [
      path.join(root, "services", "sovereign-runtime", "data", "artifacts", projectId, "styles.css"),
      path.join(root, "public", "runtime-deployments", projectId, "styles.css"),
      path.join(root, "data", "project-builds", projectId, "styles.css"),
    ]),
    checkPath("Delivery manifest", [
      path.join(root, "services", "sovereign-runtime", "data", "exports", `${projectId}.json`),
      path.join(root, "data", "exports", `${projectId}.json`),
    ]),
    checkPath("Deployment record", [
      path.join(root, "services", "sovereign-runtime", "data", "deployments", `${projectId}.json`),
    ]),
    checkPath("Artifact directory", [artifactDir]),

    checkPath("Environment database configuration", [envFile]),
    checkContent("DATABASE_URL environment marker", envFile, ["DATABASE_URL"]),
    checkPath("Prisma schema file", [prismaFile]),
    checkPrismaModels(prismaFile),
    checkPath("Package manifest", [packageFile]),
    checkPackageScripts(packageFile),
    checkFilePatterns("App routes/pages", artifactDir, files, [
      /^app\/page\.tsx$/,
      /^app\/layout\.tsx$/,
      /^app\/customer\/page\.tsx$/,
      /^app\/admin\/page\.tsx$/,
      /^app\/editor\/page\.tsx$/,
    ]),
    checkApiReadiness(artifactDir, files),
    checkFilePatterns("Delivery operations files", artifactDir, files, [
      /^Dockerfile$/,
      /^docker-compose\.yml$/,
      /^scripts\/smoke-test\.ts$/,
    ]),
    checkReadmeDelivery(readmeFile),
  ];

  const passed = results.filter((result) => result.ok).length;
  const failed = results.length - passed;

  const readiness = {
    artifactReady: results.slice(0, 6).every((result) => result.ok),
    databaseReady: results
      .filter((result) =>
        [
          "Environment database configuration",
          "DATABASE_URL environment marker",
          "Prisma schema file",
          "Database Prisma models",
          "Package database/build scripts",
        ].includes(result.label)
      )
      .every((result) => result.ok),
    appReady: results
      .filter((result) =>
        ["App routes/pages", "API/store/data readiness", "Delivery operations files", "README setup instructions"].includes(result.label)
      )
      .every((result) => result.ok),
  };

  return NextResponse.json({
    ok: failed === 0,
    projectId,
    passed,
    failed,
    readiness,
    results,
  });
}
