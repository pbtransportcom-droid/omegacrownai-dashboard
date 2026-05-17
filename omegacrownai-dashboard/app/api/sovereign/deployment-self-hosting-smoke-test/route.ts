import { NextResponse } from "next/server";
import { getDeploymentSelfHostingReadinessLayer } from "@/lib/sovereign/deployment-self-hosting-readiness";

const requiredModes = [
  "managed_saas",
  "vps_single_node",
  "docker_compose",
  "kubernetes_private_cloud",
  "air_gapped_or_offline",
];

const requiredProductionRules = [
  "Build before PM2 restart.",
  "Never restart production after failed build.",
  "Use targeted git add only.",
  "Do not commit secrets.",
  "Run route smoke tests after restart.",
];

const requiredHealthChecks = [
  "npm run build passes",
  ".next production build exists",
  "PM2 process is online",
  "Core APIs return HTTP/2 200",
  "Smoke-test APIs return ok true",
];

export async function GET() {
  const readiness = getDeploymentSelfHostingReadinessLayer();

  const modeNames = readiness.deploymentModes.map((item) => item.mode);

  const missingModes = requiredModes.filter((item) => !modeNames.includes(item));
  const missingProductionRules = requiredProductionRules.filter(
    (item) => !readiness.productionRules.includes(item)
  );
  const missingHealthChecks = requiredHealthChecks.filter(
    (item) => !readiness.healthAndRecoveryChecks.includes(item)
  );

  const checks = [
    {
      name: "Deployment readiness is ready",
      passed: readiness.status === "deployment_readiness_ready",
      detail: readiness.status,
    },
    {
      name: "Deployment modes present",
      passed: missingModes.length === 0,
      detail: missingModes.length
        ? `Missing: ${missingModes.join(", ")}`
        : "All deployment modes present.",
    },
    {
      name: "Environment registry present",
      passed: readiness.environmentRegistry.length >= 6,
      detail: `${readiness.environmentRegistry.length} environment entries`,
    },
    {
      name: "Portability requirements present",
      passed: readiness.portabilityRequirements.length >= 6,
      detail: `${readiness.portabilityRequirements.length} portability requirements`,
    },
    {
      name: "Backup/restore plan present",
      passed: readiness.backupRestorePlan.length >= 5,
      detail: `${readiness.backupRestorePlan.length} backup/restore areas`,
    },
    {
      name: "Domain/SSL requirements present",
      passed: readiness.domainSslRequirements.length >= 6,
      detail: `${readiness.domainSslRequirements.length} domain/SSL requirements`,
    },
    {
      name: "Health/recovery checks present",
      passed: missingHealthChecks.length === 0,
      detail: missingHealthChecks.length
        ? `Missing: ${missingHealthChecks.join(", ")}`
        : "Core health checks present.",
    },
    {
      name: "Self-hosting checklist present",
      passed: readiness.selfHostingReadinessChecklist.length >= 7,
      detail: `${readiness.selfHostingReadinessChecklist.length} self-hosting checklist items`,
    },
    {
      name: "Production rules present",
      passed: missingProductionRules.length === 0,
      detail: missingProductionRules.length
        ? `Missing: ${missingProductionRules.join(", ")}`
        : "Core production rules present.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v17.2 Phase 192",
    service: "Deployment / Self-Hosting Readiness Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    deploymentModeCount: readiness.deploymentModes.length,
    environmentEntryCount: readiness.environmentRegistry.length,
    portabilityRequirementCount: readiness.portabilityRequirements.length,
    backupRestoreAreaCount: readiness.backupRestorePlan.length,
    selfHostingChecklistCount: readiness.selfHostingReadinessChecklist.length,
    productionRuleCount: readiness.productionRules.length,
    checks,
  });
}
