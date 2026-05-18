import { NextResponse } from "next/server";
import { getEnterpriseFoundationCompletionSummary } from "@/lib/sovereign/enterprise-foundation-completion-summary";

const requiredLayers = [
  "Full-Function Artifact Standard + Builder Output Depth",
  "Sovereign Execution Layer",
  "Persistent Multi-Agent Memory Registry",
  "Governance, Permissions & Audit Trail",
  "Deployment / Self-Hosting Readiness",
  "Enterprise Reliability & Observability",
  "Connector / Integration Marketplace Foundation",
  "Sovereign Connector Manifest Validator",
  "Connector Install Review UI",
  "Connector Permission Gate API",
  "Connector Audit Trail Integration",
  "GitHub Connector Blueprint",
];

const requiredPillars = [
  "Customer-ready artifact delivery",
  "Safe execution",
  "Governed memory",
  "Permissioned governance",
  "Deployment sovereignty",
  "Reliability and observability",
  "Connector ecosystem",
];

const requiredProductionRules = [
  "No PM2 restart before successful build.",
  "No uncontrolled git add .",
  "Do not commit secrets.",
  "No customer-ready label without validation.",
  "No connector external write without permission gate and audit context.",
];

export async function GET() {
  const summary = getEnterpriseFoundationCompletionSummary();

  const layerNames = summary.completedFoundationLayers.map((item) => item.layer);
  const pillarNames = summary.enterpriseReadinessPillars.map((item) => item.pillar);

  const missingLayers = requiredLayers.filter((item) => !layerNames.includes(item));
  const missingPillars = requiredPillars.filter((item) => !pillarNames.includes(item));
  const missingRules = requiredProductionRules.filter(
    (item) => !summary.nonNegotiableProductionRules.includes(item)
  );

  const checks = [
    {
      name: "Enterprise foundation complete",
      passed: summary.status === "enterprise_foundation_complete",
      detail: summary.status,
    },
    {
      name: "Required foundation layers present",
      passed: missingLayers.length === 0,
      detail: missingLayers.length ? `Missing: ${missingLayers.join(", ")}` : "All required layers present.",
    },
    {
      name: "Enterprise readiness pillars present",
      passed: missingPillars.length === 0,
      detail: missingPillars.length ? `Missing: ${missingPillars.join(", ")}` : "All required pillars present.",
    },
    {
      name: "Remaining implementation work identified",
      passed: summary.remainingEnterpriseImplementationWork.length >= 6,
      detail: `${summary.remainingEnterpriseImplementationWork.length} implementation areas`,
    },
    {
      name: "Non-negotiable production rules present",
      passed: missingRules.length === 0,
      detail: missingRules.length ? `Missing: ${missingRules.join(", ")}` : "Core production rules present.",
    },
    {
      name: "Final summary present",
      passed: summary.finalPhase200Summary.length > 120,
      detail: "Final Phase 200 summary present.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v18.0 Phase 200",
    service: "Enterprise Foundation Completion Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    completedLayerCount: summary.completedFoundationLayers.length,
    enterprisePillarCount: summary.enterpriseReadinessPillars.length,
    remainingWorkCount: summary.remainingEnterpriseImplementationWork.length,
    productionRuleCount: summary.nonNegotiableProductionRules.length,
    checks,
  });
}
