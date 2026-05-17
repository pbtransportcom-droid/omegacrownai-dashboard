import { NextResponse } from "next/server";
import { getSovereignExecutionLayerBlueprint } from "@/lib/sovereign/execution-layer-blueprint";

const requiredCategories = [
  "Software execution",
  "Website/App execution",
  "Trading execution",
  "Automation execution",
  "API/tool execution",
  "Production deployment",
];

const requiredProductionRules = [
  "No PM2 restart before successful build.",
  "No uncontrolled git add .",
  "No customer-ready claim without validation.",
  "No deployment without route smoke checks.",
];

const requiredApprovalGates = [
  "low_risk",
  "medium_risk",
  "high_risk",
  "blocked_by_default",
];

export async function GET() {
  const blueprint = getSovereignExecutionLayerBlueprint();

  const categoryNames = blueprint.executionCategories.map((item) => item.category);
  const approvalGateNames = blueprint.approvalGates.map((item) => item.gate);

  const missingCategories = requiredCategories.filter(
    (item) => !categoryNames.includes(item)
  );

  const missingProductionRules = requiredProductionRules.filter(
    (item) => !blueprint.productionRules.includes(item)
  );

  const missingApprovalGates = requiredApprovalGates.filter(
    (item) => !approvalGateNames.includes(item)
  );

  const checks = [
    {
      name: "Blueprint is ready",
      passed: blueprint.status === "blueprint_ready",
      detail: blueprint.status,
    },
    {
      name: "Execution categories present",
      passed: missingCategories.length === 0,
      detail: missingCategories.length
        ? `Missing: ${missingCategories.join(", ")}`
        : "All execution categories present.",
    },
    {
      name: "Approval gates present",
      passed: missingApprovalGates.length === 0,
      detail: missingApprovalGates.length
        ? `Missing: ${missingApprovalGates.join(", ")}`
        : "All approval gates present.",
    },
    {
      name: "Action registry shape present",
      passed: Boolean(
        blueprint.actionRegistryShape.actionId &&
          blueprint.actionRegistryShape.requiredPermissions &&
          blueprint.actionRegistryShape.rollback
      ),
      detail: "Action registry schema defined.",
    },
    {
      name: "Replayable pipeline requirements present",
      passed: blueprint.replayablePipelineRequirements.length >= 5,
      detail: `${blueprint.replayablePipelineRequirements.length} replay requirements`,
    },
    {
      name: "Sandbox rules present",
      passed: blueprint.sandboxRules.length >= 7,
      detail: `${blueprint.sandboxRules.length} sandbox rules`,
    },
    {
      name: "Production safety rules present",
      passed: missingProductionRules.length === 0,
      detail: missingProductionRules.length
        ? `Missing: ${missingProductionRules.join(", ")}`
        : "Core production rules present.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v16.9 Phase 189",
    service: "Sovereign Execution Layer Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    executionCategoryCount: blueprint.executionCategories.length,
    approvalGateCount: blueprint.approvalGates.length,
    sandboxRuleCount: blueprint.sandboxRules.length,
    productionRuleCount: blueprint.productionRules.length,
    checks,
  });
}
