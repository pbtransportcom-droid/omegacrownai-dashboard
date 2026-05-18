import { NextResponse } from "next/server";
import {
  createAuditExportDownloadPackage,
  getAuditExportDownloadRouteBlueprint,
} from "@/lib/sovereign/audit-export-download";

const requiredFiles = [
  "audit-summary.json",
  "redacted-events.json",
  "evidence-chain.json",
  "correlation-replay.json",
  "reviewer-notes.md",
  "secret-exclusions.json",
];

const requiredDownloadRules = [
  "Export must be redacted.",
  "Export must include a manifest.",
  "Export must include secret exclusions.",
  "Export must include reviewer notes.",
  "Export must include correlation replay summary.",
  "Export must return attachment content-disposition.",
  "Export must use no-store cache policy.",
  "Export must not include raw secrets or sensitive payloads.",
];

export async function GET() {
  const blueprint = getAuditExportDownloadRouteBlueprint();
  const pkg = createAuditExportDownloadPackage({
    exportType: "correlation_replay_export",
    correlationId: "corr_phase_208_sample",
    requestedBy: "admin",
    reason: "internal_review",
    format: "json",
  });

  const missingFiles = requiredFiles.filter((file) => !pkg.manifest.includes(file));
  const missingRules = requiredDownloadRules.filter(
    (rule) => !blueprint.downloadRules.includes(rule)
  );

  const checks = [
    {
      name: "Audit export download route is ready",
      passed: blueprint.status === "audit_export_download_route_ready",
      detail: blueprint.status,
    },
    {
      name: "Download package is valid",
      passed: pkg.ok === true,
      detail: pkg.ok ? "Package valid." : pkg.validation.errors.join(", "),
    },
    {
      name: "Required manifest files present",
      passed: missingFiles.length === 0,
      detail: missingFiles.length ? `Missing: ${missingFiles.join(", ")}` : "All files present.",
    },
    {
      name: "Package is redacted",
      passed: pkg.redacted === true,
      detail: "Redacted package confirmed.",
    },
    {
      name: "Content disposition attachment present",
      passed:
        typeof pkg.downloadHeaders["Content-Disposition"] === "string" &&
        pkg.downloadHeaders["Content-Disposition"].includes("attachment"),
      detail: pkg.downloadHeaders["Content-Disposition"],
    },
    {
      name: "No-store cache policy present",
      passed: pkg.downloadHeaders["Cache-Control"] === "no-store",
      detail: pkg.downloadHeaders["Cache-Control"],
    },
    {
      name: "Secret exclusions file present",
      passed:
        Boolean(pkg.packageFiles["secret-exclusions.json"]) &&
        pkg.packageFiles["secret-exclusions.json"].excludedSensitiveData.length >= 8,
      detail: "Secret exclusions present.",
    },
    {
      name: "Reviewer notes present",
      passed:
        typeof pkg.packageFiles["reviewer-notes.md"] === "string" &&
        pkg.packageFiles["reviewer-notes.md"].includes("Review Notes"),
      detail: "Reviewer notes present.",
    },
    {
      name: "Download rules present",
      passed: missingRules.length === 0,
      detail: missingRules.length ? `Missing: ${missingRules.join(", ")}` : "All rules present.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v19.6 Phase 216",
    service: "Audit Export Download Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    manifestFileCount: pkg.manifest.length,
    requiredFileCount: requiredFiles.length,
    downloadRuleCount: blueprint.downloadRules.length,
    redacted: pkg.redacted,
    filename: pkg.filename,
    checks,
  });
}
