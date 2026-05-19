import { NextResponse } from "next/server";
import {
  getProductionWebsiteAppGeneratorFileWriter,
  simulateProductionWebsiteAppFileWrite,
} from "@/lib/sovereign/production-website-app-generator-file-writer";

const requiredOutputGroups = [
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
];

const requiredSafetyRules = [
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
];

export async function GET() {
  const writer = getProductionWebsiteAppGeneratorFileWriter();

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

  const missingOutputGroups = requiredOutputGroups.filter(
    (item) => !writer.requiredOutputGroups.includes(item)
  );

  const missingSafetyRules = requiredSafetyRules.filter(
    (item) => !writer.writerSafetyRules.includes(item)
  );

  const unsafeWrite = fullStack.plannedWrites.some(
    (file) =>
      file.relativePath.startsWith("../") ||
      file.relativePath.startsWith("/") ||
      file.relativePath.includes("\0") ||
      file.relativePath === ".env" ||
      file.relativePath.startsWith("node_modules/") ||
      file.relativePath.startsWith(".next/")
  );

  const checks = [
    {
      name: "Production Website/App Generator File Writer is ready",
      passed: writer.status === "production_website_app_generator_file_writer_ready",
      detail: writer.status,
    },
    {
      name: "File writer contract present",
      passed:
        writer.fileWriterContract.requiresReleaseGate === true &&
        writer.fileWriterContract.writesSourceFiles === true &&
        writer.fileWriterContract.writesReportFiles === true &&
        writer.fileWriterContract.writesZipReadyManifest === true,
      detail: "File writer contract defined.",
    },
    {
      name: "Required output groups present",
      passed: missingOutputGroups.length === 0,
      detail: missingOutputGroups.length ? `Missing: ${missingOutputGroups.join(", ")}` : "All output groups present.",
    },
    {
      name: "Writer flow present",
      passed: writer.writerFlow.length >= 11,
      detail: `${writer.writerFlow.length} writer flow steps`,
    },
    {
      name: "Writer safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "Safety rules present.",
    },
    {
      name: "Full-stack write passes release gate",
      passed:
        fullStack.writeReceipt.releaseAllowed === true &&
        fullStack.writeReceipt.customerReady === true &&
        fullStack.writeReceipt.completenessScore === 100 &&
        fullStack.writeReceipt.plannedFileCount >= 20,
      detail: `score ${fullStack.writeReceipt.completenessScore}`,
    },
    {
      name: "Homepage-only write is blocked by release gate",
      passed:
        homepageOnly.writeReceipt.releaseAllowed === false &&
        homepageOnly.writeReceipt.customerReady === false &&
        homepageOnly.writeReceipt.completenessScore === 15,
      detail: `score ${homepageOnly.writeReceipt.completenessScore}`,
    },
    {
      name: "Planned writes include source and report files",
      passed:
        fullStack.writeReceipt.sourceFileCount >= 10 &&
        fullStack.writeReceipt.reportFileCount >= 6 &&
        fullStack.outputManifest.zipReady === true,
      detail: `${fullStack.writeReceipt.sourceFileCount} source, ${fullStack.writeReceipt.reportFileCount} reports`,
    },
    {
      name: "Planned writes are safe",
      passed:
        unsafeWrite === false &&
        fullStack.safety.rawEnvWritten === false &&
        fullStack.safety.secretsWritten === false &&
        fullStack.safety.nodeModulesWritten === false &&
        fullStack.safety.nextCacheWritten === false,
      detail: unsafeWrite ? "Unsafe planned write detected." : "No unsafe planned writes.",
    },
    {
      name: "Receipt shape and samples present",
      passed:
        writer.fileWriteReceiptShape.redacted === true &&
        writer.sampleWrites.fullStack.releaseAllowed === true &&
        writer.sampleWrites.homepageOnly.releaseAllowed === false,
      detail: "Receipt shape and samples pass.",
    },
    {
      name: "Completeness checks present",
      passed: writer.fileWriterCompletenessChecks.length >= 8,
      detail: `${writer.fileWriterCompletenessChecks.length} checks`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v26.1 Phase 281",
    service: "Production Website/App Generator File Writer Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    requiredOutputGroupCount: writer.requiredOutputGroups.length,
    writerFlowStepCount: writer.writerFlow.length,
    writerSafetyRuleCount: writer.writerSafetyRules.length,
    fullStackReleaseAllowed: fullStack.writeReceipt.releaseAllowed,
    fullStackScore: fullStack.writeReceipt.completenessScore,
    fullStackPlannedFileCount: fullStack.writeReceipt.plannedFileCount,
    fullStackSourceFileCount: fullStack.writeReceipt.sourceFileCount,
    fullStackReportFileCount: fullStack.writeReceipt.reportFileCount,
    homepageOnlyReleaseAllowed: homepageOnly.writeReceipt.releaseAllowed,
    homepageOnlyScore: homepageOnly.writeReceipt.completenessScore,
    completenessCheckCount: writer.fileWriterCompletenessChecks.length,
    checks,
  });
}
