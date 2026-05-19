import path from "path";
import { evaluateCustomerArtifactReleaseGate } from "@/lib/sovereign/full-function-customer-artifact-release-gate";
import { executeProductionArtifactWriter } from "@/lib/sovereign/production-artifact-writer-execution-route";
import { createGeneratedArtifactFileSystemWritePlan } from "@/lib/sovereign/generated-artifact-file-system-writer";
import { createCustomerArtifactPackage } from "@/lib/sovereign/download-zip-writer";

type FileWriterInput = {
  projectId?: string;
  artifactId?: string;
  requestedBy?: string;
  artifactMode?: "full_stack" | "homepage_only" | "missing_backend";
};

function safeId(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
  return cleaned || fallback;
}

function safeRelativePath(filePath: string) {
  const cleaned = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const normalized = path.posix.normalize(cleaned);

  if (
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.includes("\0") ||
    path.isAbsolute(normalized)
  ) {
    throw new Error(`Unsafe generated file path blocked: ${filePath}`);
  }

  return normalized;
}

export function simulateProductionWebsiteAppFileWrite(input: FileWriterInput = {}) {
  const projectId = safeId(input.projectId, "cmoyy1gl700004mkqn7or7hxr");
  const requestedBy = safeId(input.requestedBy, "system");
  const artifactMode = input.artifactMode || "full_stack";

  const releaseGate = evaluateCustomerArtifactReleaseGate({
    projectId,
    requestedBy,
    artifactMode,
  });

  const execution = executeProductionArtifactWriter({
    projectId,
    requestedBy,
    prompt:
      "Build production website/app files with frontend, backend, database, admin, preview, deployment, validation, missing-info, ZIP, storage, and audit trail.",
  });

  const artifactId = safeId(input.artifactId, execution.receipt.artifactId);

  const writePlan = createGeneratedArtifactFileSystemWritePlan({
    projectId,
    artifactId,
  });

  const zipPackage = createCustomerArtifactPackage(projectId, artifactId);

  const plannedWrites = writePlan.plannedFiles.map((file) => ({
    relativePath: safeRelativePath(file.relativePath),
    outputPath: safeRelativePath(file.outputPath),
    byteLength: file.byteLength,
    redacted: true,
  }));

  const reportFiles = plannedWrites.filter((file) =>
    [
      "README.md",
      "deployment.md",
      "artifact-manifest.json",
      "validation-report.json",
      "missing-info-report.md",
      ".env.example",
    ].includes(file.relativePath)
  );

  const sourceFiles = plannedWrites.filter(
    (file) => !reportFiles.some((report) => report.relativePath === file.relativePath)
  );

  const releaseAllowed = releaseGate.releaseReceipt.releaseAllowed === true;

  return {
    ok: true,
    phase: "v26.1 Phase 281",
    mode: "production_website_app_generator_file_write_preview",
    writeReceipt: {
      writeId: `production_file_write_${projectId}_${artifactId}`,
      projectId,
      artifactId,
      requestedBy,
      releaseAllowed,
      customerReady: releaseGate.releaseReceipt.customerReady,
      completenessScore: releaseGate.releaseReceipt.completenessScore,
      exportLabel: releaseGate.releaseReceipt.exportLabel,
      artifactRoot: writePlan.artifactRoot,
      zipPath: writePlan.zipPath,
      sourceFileCount: sourceFiles.length,
      reportFileCount: reportFiles.length,
      plannedFileCount: plannedWrites.length,
      totalBytes: writePlan.totalBytes,
      zipSizeBytes: zipPackage.zipSizeBytes,
      previewPath: releaseGate.releaseReceipt.previewPath,
      downloadPath: releaseGate.releaseReceipt.downloadPath,
      historyPath: releaseGate.releaseReceipt.historyPath,
      distributionPath: releaseGate.releaseReceipt.distributionPath,
      validationReportPath: releaseGate.releaseReceipt.validationReportPath,
      missingInfoReportPath: releaseGate.releaseReceipt.missingInfoReportPath,
      redacted: true,
    },
    plannedWrites,
    outputManifest: {
      artifactId,
      projectId,
      fileCount: plannedWrites.length,
      sourceFileCount: sourceFiles.length,
      reportFileCount: reportFiles.length,
      zipReady: true,
      releaseGatePassed: releaseAllowed,
      redacted: true,
    },
    safety: {
      pathTraversalBlocked: true,
      absolutePathsBlocked: true,
      rawEnvWritten: false,
      secretsWritten: false,
      tokensWritten: false,
      privateKeysWritten: false,
      nodeModulesWritten: false,
      nextCacheWritten: false,
      logsWritten: false,
      redacted: true,
    },
  };
}

export function getProductionWebsiteAppGeneratorFileWriter() {
  const fullStack = simulateProductionWebsiteAppFileWrite({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "full_stack",
  });

  const homepageOnly = simulateProductionWebsiteAppFileWrite({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "homepage_only",
  });

  return {
    system: "OmegaCrownAI Production Website/App Generator File Writer",
    phase: "v26.1 Phase 281",
    status: "production_website_app_generator_file_writer_ready",
    purpose:
      "Define the production file writer that turns generated full-stack website/app artifacts into project-scoped source files, reports, manifests, and ZIP-ready output while enforcing release gate and safety rules.",
    corePrinciple:
      "Generated website/app files must be written only to safe project-scoped artifact paths, include reports, pass release gate before customer-ready delivery, and never write secrets or unsafe runtime folders.",

    fileWriterContract: {
      route: "/api/sovereign/production-website-app-generator-file-writer",
      projectRoute: "/api/projects/[id]/artifacts/write-production-files",
      method: "POST",
      requiresReleaseGate: true,
      writesSourceFiles: true,
      writesReportFiles: true,
      writesZipReadyManifest: true,
      redacted: true,
    },

    outputRootPattern:
      "public/uploads/projects/{projectId}/artifacts/{artifactId}",

    requiredOutputGroups: [
      "frontend source files",
      "backend API files",
      "database schema files",
      "admin review files",
      "preview sandbox files",
      "deployment/export files",
      "README.md",
      ".env.example",
      "deployment.md",
      "artifact-manifest.json",
      "validation-report.json",
      "missing-info-report.md",
    ],

    writerFlow: [
      "Receive projectId, artifactId, requestedBy, and artifactMode.",
      "Normalize safe project and artifact IDs.",
      "Run full-function release gate.",
      "Create production artifact execution receipt.",
      "Create generated file-system write plan.",
      "Normalize every output path.",
      "Block path traversal and absolute paths.",
      "Prepare source file tree writes.",
      "Prepare report file writes.",
      "Prepare ZIP-ready output manifest.",
      "Return redacted production file write receipt.",
    ],

    writerSafetyRules: [
      "Do not write outside project-scoped artifact root.",
      "Block ../ path traversal.",
      "Block absolute paths.",
      "Block null bytes.",
      "Do not write raw .env.",
      "Write .env.example only.",
      "Do not write secrets, tokens, API keys, passwords, or private keys.",
      "Do not write node_modules.",
      "Do not write .next cache.",
      "Do not write server logs or PM2 logs.",
      "Do not mark files customer-ready unless release gate passes.",
    ],

    fileWriteReceiptShape: {
      writeId: "production file write id",
      projectId: "project id",
      artifactId: "artifact id",
      releaseAllowed: "boolean",
      customerReady: "boolean",
      completenessScore: "0-100",
      exportLabel: "export label",
      artifactRoot: "project-scoped output root",
      sourceFileCount: "number",
      reportFileCount: "number",
      plannedFileCount: "number",
      zipSizeBytes: "number",
      previewPath: "preview path",
      downloadPath: "download path",
      historyPath: "history path",
      distributionPath: "distribution path",
      redacted: true,
    },

    sampleWrites: {
      fullStack: fullStack.writeReceipt,
      homepageOnly: homepageOnly.writeReceipt,
    },

    fileWriterCompletenessChecks: [
      "File writer contract defines sovereign and project POST routes.",
      "Output root is project-scoped.",
      "Required output groups include source files, reports, env example, manifest, validation, and missing-info.",
      "Writer flow runs release gate, write plan, path normalization, source writes, report writes, and manifest creation.",
      "Safety rules block traversal, absolute paths, raw env, secrets, runtime folders, logs, and false customer-ready delivery.",
      "Full-stack sample write is releaseAllowed and customer-ready.",
      "Homepage-only sample write is blocked by release gate.",
      "Receipt shape includes score, label, root, counts, ZIP, paths, and redaction.",
    ],

    nextImplementationPhases: [
      "Customer Artifact Billing/Entitlement Gate",
      "Artifact Storage Real Prisma Write Implementation",
      "Customer Artifact Delivery Dashboard",
      "Full-Function Artifact System Completion Summary",
      "Production Launch Hardening",
    ],
  };
}
