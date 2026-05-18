import { NextResponse } from "next/server";
import { getSovereignAuditSystemCompletionSummary } from "@/lib/sovereign/audit-system-completion-summary";

const requiredLayers = [
  "Persistent Audit Database Schema",
  "Real Connector Install Store",
  "GitHub OAuth Connector Implementation Blueprint",
  "Execution Runner Persistent Action Log",
  "Audit Event Write API Blueprint",
  "Audit Event Query API Blueprint",
  "Audit Event Review UI Blueprint",
  "Correlation Replay View Blueprint",
  "Audit Export API Blueprint",
];

const requiredCapabilities = [
  "Append-only audit write contract",
  "Redacted audit query/read contract",
  "Correlation ID replay",
  "Safe evidence chain",
  "Secret exclusion policy",
  "Invalid/unsafe payload rejection",
];

const requiredNoSecretRules = [
  "Do not store raw OAuth tokens.",
  "Do not store API keys.",
  "Do not store passwords.",
  "Do not store bearer authorization headers.",
  "Do not store private keys.",
  "Do not store webhook secrets.",
];

export async function GET() {
  const summary = getSovereignAuditSystemCompletionSummary();

  const layerNames = summary.completedAuditLayers.map((item) => item.layer);
  const missingLayers = requiredLayers.filter((item) => !layerNames.includes(item));
  const missingCapabilities = requiredCapabilities.filter(
    (item) => !summary.auditCapabilities.includes(item)
  );
  const missingNoSecretRules = requiredNoSecretRules.filter(
    (item) => !summary.noSecretAuditPolicy.includes(item)
  );

  const checks = [
    {
      name: "Audit system foundation complete",
      passed: summary.status === "sovereign_audit_system_foundation_complete",
      detail: summary.status,
    },
    {
      name: "Required audit layers present",
      passed: missingLayers.length === 0,
      detail: missingLayers.length ? `Missing: ${missingLayers.join(", ")}` : "All required layers present.",
    },
    {
      name: "Audit capabilities present",
      passed: missingCapabilities.length === 0,
      detail: missingCapabilities.length
        ? `Missing: ${missingCapabilities.join(", ")}`
        : "Core capabilities present.",
    },
    {
      name: "No-secret audit policy present",
      passed: missingNoSecretRules.length === 0,
      detail: missingNoSecretRules.length
        ? `Missing: ${missingNoSecretRules.join(", ")}`
        : "Core no-secret rules present.",
    },
    {
      name: "Enterprise readiness pillars present",
      passed: summary.enterpriseAuditReadinessPillars.length >= 6,
      detail: `${summary.enterpriseAuditReadinessPillars.length} readiness pillars`,
    },
    {
      name: "Remaining implementation work present",
      passed: summary.remainingImplementationWork.length >= 6,
      detail: `${summary.remainingImplementationWork.length} implementation areas`,
    },
    {
      name: "Final Phase 210 summary present",
      passed: summary.finalPhase210Summary.length > 160,
      detail: "Final summary present.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v19.0 Phase 210",
    service: "Sovereign Audit System Completion Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    completedAuditLayerCount: summary.completedAuditLayers.length,
    auditCapabilityCount: summary.auditCapabilities.length,
    noSecretRuleCount: summary.noSecretAuditPolicy.length,
    readinessPillarCount: summary.enterpriseAuditReadinessPillars.length,
    remainingWorkCount: summary.remainingImplementationWork.length,
    checks,
  });
}
