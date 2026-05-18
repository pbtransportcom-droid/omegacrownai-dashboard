import { NextResponse } from "next/server";
import {
  createCustomerArtifactPackage,
  getDownloadZipWriterImplementation,
} from "@/lib/sovereign/download-zip-writer";

export async function GET() {
  const implementation = getDownloadZipWriterImplementation();
  const pkg = createCustomerArtifactPackage("cmoyy1gl700004mkqn7or7hxr");

  const fileNames = pkg.files.map((file) => file.path);

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

  const missingFiles = requiredFiles.filter((file) => !fileNames.includes(file));

  const zipHasSignature =
    pkg.zip.length > 4 &&
    pkg.zip[0] === 0x50 &&
    pkg.zip[1] === 0x4b &&
    pkg.zip[2] === 0x03 &&
    pkg.zip[3] === 0x04;

  const checks = [
    {
      name: "Download ZIP Writer Implementation is ready",
      passed: implementation.status === "download_zip_writer_implementation_ready",
      detail: implementation.status,
    },
    {
      name: "ZIP package has valid local file header signature",
      passed: zipHasSignature,
      detail: zipHasSignature ? "PK zip signature present." : "ZIP signature missing.",
    },
    {
      name: "ZIP package includes required generated files",
      passed: missingFiles.length === 0,
      detail: missingFiles.length ? `Missing: ${missingFiles.join(", ")}` : "Required files present.",
    },
    {
      name: "ZIP package has meaningful file count",
      passed: pkg.fileCount >= 20,
      detail: `${pkg.fileCount} files`,
    },
    {
      name: "ZIP package has non-empty size",
      passed: pkg.zipSizeBytes > 1000,
      detail: `${pkg.zipSizeBytes} bytes`,
    },
    {
      name: "ZIP response headers are attachment/no-store/redacted",
      passed:
        pkg.headers["Content-Disposition"].includes("attachment") &&
        pkg.headers["Cache-Control"] === "no-store" &&
        pkg.headers["X-OmegaCrownAI-Redacted"] === "true",
      detail: "Headers valid.",
    },
    {
      name: "Safety excludes unsafe runtime and secret files",
      passed:
        pkg.safety.excludesSecrets === true &&
        pkg.safety.excludesEnv === true &&
        pkg.safety.excludesNodeModules === true &&
        pkg.safety.excludesNextCache === true,
      detail: "Unsafe files excluded.",
    },
    {
      name: "Artifact manifest and reports are included",
      passed:
        implementation.includedReports.includes("artifact-manifest.json") &&
        implementation.includedReports.includes("validation-report.json") &&
        implementation.includedReports.includes("missing-info-report.md"),
      detail: `${implementation.includedReports.length} reports`,
    },
    {
      name: "Sample package customer-ready score is preserved",
      passed:
        implementation.samplePackage.customerReady === true &&
        implementation.samplePackage.completenessScore === 100,
      detail: `score ${implementation.samplePackage.completenessScore}`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v24.3 Phase 263",
    service: "Download ZIP Writer Implementation Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    fileCount: pkg.fileCount,
    zipSizeBytes: pkg.zipSizeBytes,
    filename: pkg.filename,
    contentType: pkg.contentType,
    customerReady: pkg.artifact.customerReady,
    completenessScore: pkg.artifact.completenessScore,
    checks,
  });
}
