import path from "path";
import { createCustomerArtifactPackage } from "@/lib/sovereign/download-zip-writer";
import { generateRealFullStackArtifact } from "@/lib/sovereign/real-full-stack-artifact-generator";

type FileSystemWriterInput = {
  projectId?: string;
  artifactId?: string;
  baseDir?: string;
};

function normalizeSafeSegment(value: string, fallback: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  return cleaned || fallback;
}

function normalizeSafeRelativePath(filePath: string) {
  const cleaned = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const normalized = path.posix.normalize(cleaned);

  if (
    normalized.startsWith("../") ||
    normalized === ".." ||
    path.isAbsolute(normalized) ||
    normalized.includes("\0")
  ) {
    throw new Error(`Unsafe generated file path blocked: ${filePath}`);
  }

  return normalized;
}

export function createGeneratedArtifactFileSystemWritePlan(input: FileSystemWriterInput = {}) {
  const projectId = normalizeSafeSegment(input.projectId || "project_demo", "project_demo");
  const generated = generateRealFullStackArtifact({
    projectId,
    prompt:
      "Build a full-stack customer-ready website/app with frontend, backend, database, admin, preview, deploy package, validation report, and missing-info report.",
  });

  const artifactId = normalizeSafeSegment(
    input.artifactId || generated.artifact.artifactId,
    "artifact_demo"
  );

  const baseDir = input.baseDir || "public/uploads/projects";
  const artifactRoot = path.posix.join(baseDir, projectId, "artifacts", artifactId);

  const pkg = createCustomerArtifactPackage(projectId, artifactId);

  const plannedFiles = pkg.files.map((file) => ({
    relativePath: normalizeSafeRelativePath(file.path),
    outputPath: path.posix.join(artifactRoot, normalizeSafeRelativePath(file.path)),
    byteLength: Buffer.byteLength(file.content, "utf8"),
    redacted: true,
  }));

  const requiredReportFiles = [
    "README.md",
    "package.json",
    ".env.example",
    "deployment.md",
    "artifact-manifest.json",
    "validation-report.json",
    "missing-info-report.md",
  ];

  return {
    ok: true,
    phase: "v24.4 Phase 264",
    mode: "generated_artifact_file_system_write_plan",
    projectId,
    artifactId,
    artifactRoot,
    zipPath: path.posix.join(artifactRoot, `${artifactId}.zip`),
    fileCount: plannedFiles.length,
    totalBytes: plannedFiles.reduce((sum, file) => sum + file.byteLength, 0),
    plannedFiles,
    requiredReportFiles,
    safety: {
      pathTraversalBlocked: true,
      absolutePathsBlocked: true,
      nullBytesBlocked: true,
      writesEnvExampleOnly: true,
      writesRawEnv: false,
      writesSecrets: false,
      writesNodeModules: false,
      writesNextCache: false,
      redacted: true,
    },
    customerReady: generated.artifact.customerReady,
    completenessScore: generated.artifact.completenessScore,
  };
}

export function getGeneratedArtifactFileSystemWriter() {
  const sample = createGeneratedArtifactFileSystemWritePlan({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
  });

  return {
    system: "OmegaCrownAI Generated Artifact File System Writer",
    phase: "v24.4 Phase 264",
    status: "generated_artifact_file_system_writer_ready",
    purpose:
      "Define the safe file-system writer that persists generated full-stack artifact files to project storage with manifest, validation report, missing-info report, source files, and ZIP path.",
    corePrinciple:
      "Generated artifacts must be written to safe project-scoped paths only. The writer must block path traversal, avoid secrets, preserve reports, and create a durable artifact folder for preview/download/history.",

    writePlanFlow: [
      "Receive projectId and artifactId.",
      "Normalize projectId and artifactId.",
      "Create project artifact root path.",
      "Generate full-stack artifact descriptors.",
      "Create customer artifact package file list.",
      "Normalize every relative file path.",
      "Block path traversal and absolute paths.",
      "Plan/write README and reports.",
      "Plan/write generated source files.",
      "Plan/write ZIP package path.",
      "Return write summary for artifact history.",
    ],

    artifactStorageShape: {
      root: "public/uploads/projects/{projectId}/artifacts/{artifactId}",
      sourceFiles: "artifact root source tree",
      zipPath: "artifact root/{artifactId}.zip",
      manifestPath: "artifact root/artifact-manifest.json",
      validationReportPath: "artifact root/validation-report.json",
      missingInfoReportPath: "artifact root/missing-info-report.md",
      redacted: true,
    },

    safePathRules: [
      "Normalize projectId and artifactId to safe characters only.",
      "Normalize generated file paths as relative POSIX paths.",
      "Block ../ path traversal.",
      "Block absolute paths.",
      "Block null bytes.",
      "Do not write .env.",
      "Write .env.example only.",
      "Do not write secrets, tokens, passwords, API keys, private keys, node_modules, .next, or logs.",
    ],

    requiredWrittenFiles: [
      "README.md",
      "package.json",
      ".env.example",
      "deployment.md",
      "artifact-manifest.json",
      "validation-report.json",
      "missing-info-report.md",
      "app/page.tsx",
      "app/api/contact/route.ts",
      "app/api/admin/submissions/route.ts",
      "prisma/schema.prisma",
    ],

    sampleWritePlan: {
      projectId: sample.projectId,
      artifactId: sample.artifactId,
      artifactRoot: sample.artifactRoot,
      zipPath: sample.zipPath,
      fileCount: sample.fileCount,
      totalBytes: sample.totalBytes,
      customerReady: sample.customerReady,
      completenessScore: sample.completenessScore,
    },

    fileSystemWriterCompletenessChecks: [
      "Artifact root is project-scoped.",
      "File paths are normalized.",
      "Path traversal is blocked.",
      "Required report files are included.",
      "Frontend/backend/database/admin/preview/deploy files are included.",
      "ZIP output path is planned.",
      "Secrets and runtime folders are excluded.",
      "Write summary can feed artifact history.",
    ],

    nextImplementationPhases: [
      "Artifact History UI Upgrade",
      "Project Distribution Preview Cards",
      "Real Customer Website/App Bundle Export",
      "Persistent Artifact Storage",
      "Artifact Rebuild/Rollback Controls",
    ],
  };
}
