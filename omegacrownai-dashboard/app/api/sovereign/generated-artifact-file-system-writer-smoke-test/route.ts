import { NextResponse } from "next/server";
import {
  createGeneratedArtifactFileSystemWritePlan,
  getGeneratedArtifactFileSystemWriter,
} from "@/lib/sovereign/generated-artifact-file-system-writer";

export async function GET() {
  const writer = getGeneratedArtifactFileSystemWriter();
  const plan = createGeneratedArtifactFileSystemWritePlan({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
  });

  let traversalBlocked = false;
  try {
    createGeneratedArtifactFileSystemWritePlan({
      projectId: "../bad",
      artifactId: "../../evil",
    });
  } catch {
    traversalBlocked = true;
  }

  const filePaths = plan.plannedFiles.map((file) => file.relativePath);

  const requiredFiles = [
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
  ];

  const missingFiles = requiredFiles.filter((file) => !filePaths.includes(file));

  const unsafePlanned =
    filePaths.some((file) => file.startsWith("../") || file.startsWith("/") || file.includes("\0")) ||
    filePaths.includes(".env") ||
    filePaths.some((file) => file.startsWith("node_modules/")) ||
    filePaths.some((file) => file.startsWith(".next/"));

  const checks = [
    {
      name: "Generated Artifact File System Writer is ready",
      passed: writer.status === "generated_artifact_file_system_writer_ready",
      detail: writer.status,
    },
    {
      name: "Write plan flow present",
      passed: writer.writePlanFlow.length >= 11,
      detail: `${writer.writePlanFlow.length} flow steps`,
    },
    {
      name: "Artifact storage shape present",
      passed:
        Boolean(writer.artifactStorageShape.root) &&
        Boolean(writer.artifactStorageShape.zipPath) &&
        Boolean(writer.artifactStorageShape.validationReportPath) &&
        writer.artifactStorageShape.redacted === true,
      detail: "Artifact storage shape defined.",
    },
    {
      name: "Safe path rules present",
      passed: writer.safePathRules.length >= 9,
      detail: `${writer.safePathRules.length} safe path rules`,
    },
    {
      name: "Required files planned",
      passed: missingFiles.length === 0,
      detail: missingFiles.length ? `Missing: ${missingFiles.join(", ")}` : "Required files present.",
    },
    {
      name: "Unsafe files are not planned",
      passed: unsafePlanned === false,
      detail: unsafePlanned ? "Unsafe files found." : "No unsafe planned files.",
    },
    {
      name: "Write plan has meaningful file count and bytes",
      passed: plan.fileCount >= 20 && plan.totalBytes > 1000,
      detail: `${plan.fileCount} files, ${plan.totalBytes} bytes`,
    },
    {
      name: "Write safety flags are active",
      passed:
        plan.safety.pathTraversalBlocked === true &&
        plan.safety.absolutePathsBlocked === true &&
        plan.safety.writesEnvExampleOnly === true &&
        plan.safety.writesRawEnv === false &&
        plan.safety.writesSecrets === false,
      detail: "Safety flags active.",
    },
    {
      name: "Sample write plan is customer-ready",
      passed:
        writer.sampleWritePlan.customerReady === true &&
        writer.sampleWritePlan.completenessScore === 100,
      detail: `score ${writer.sampleWritePlan.completenessScore}`,
    },
    {
      name: "Completeness checks present",
      passed: writer.fileSystemWriterCompletenessChecks.length >= 8,
      detail: `${writer.fileSystemWriterCompletenessChecks.length} checks`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v24.4 Phase 264",
    service: "Generated Artifact File System Writer Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    plannedFileCount: plan.fileCount,
    totalBytes: plan.totalBytes,
    requiredFileCount: requiredFiles.length,
    unsafePlanned,
    traversalBlocked,
    customerReady: plan.customerReady,
    completenessScore: plan.completenessScore,
    checks,
  });
}
