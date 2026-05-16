import { NextResponse } from "next/server";
import { getSovereignSelfImprovementEngine } from "@/lib/sovereign/self-improvement-engine";

const requiredEngines = [
  "Self-Repair Engine",
  "Syntax Repair Engine",
  "Evaluation Harness",
  "Accuracy Engine",
  "Prompt Quality Engine",
  "Model Router",
  "Learning Ledger",
];

const requiredGuardrails = [
  "No PM2 restart before npm run build succeeds",
  "No uncontrolled git add .",
  "No committing secrets",
  "No live trading by default",
];

const requiredReleaseSteps = [
  "Inspect git status",
  "Apply targeted patch",
  "Run npm run build",
  "Run route smoke tests",
  "Restart PM2 only after build success",
  "Verify production HTTP 200",
  "Commit targeted files",
  "Check PM2 logs",
];

export async function GET() {
  const engine = getSovereignSelfImprovementEngine();

  const engineNames = engine.engines.map((item) => item.name);

  const missingEngines = requiredEngines.filter(
    (item) => !engineNames.includes(item)
  );

  const missingGuardrails = requiredGuardrails.filter(
    (item) => !engine.productionGuardrails.includes(item)
  );

  const missingReleaseSteps = requiredReleaseSteps.filter(
    (item) => !engine.requiredReleaseSequence.includes(item)
  );

  const learningLedger = engine.engines.find(
    (item) => item.name === "Learning Ledger"
  );

  const learningLedgerRecords =
    learningLedger && "records" in learningLedger && Array.isArray(learningLedger.records)
      ? learningLedger.records
      : [];

  const checks = [
    {
      name: "Engine status is ready",
      passed: engine.status === "control_layer_ready",
      detail: engine.status,
    },
    {
      name: "All required engines present",
      passed: missingEngines.length === 0,
      detail: missingEngines.length
        ? `Missing: ${missingEngines.join(", ")}`
        : "All required engines present.",
    },
    {
      name: "Required production guardrails present",
      passed: missingGuardrails.length === 0,
      detail: missingGuardrails.length
        ? `Missing: ${missingGuardrails.join(", ")}`
        : "Core guardrails present.",
    },
    {
      name: "Required release sequence present",
      passed: missingReleaseSteps.length === 0,
      detail: missingReleaseSteps.length
        ? `Missing: ${missingReleaseSteps.join(", ")}`
        : "Release sequence present.",
    },
    {
      name: "Core build-before-restart rule exists",
      passed: engine.coreRule.includes(
        "Never restart production before a successful build"
      ),
      detail: engine.coreRule,
    },
    {
      name: "Learning ledger has records",
      passed: learningLedgerRecords.length >= 3,
      detail: learningLedgerRecords.length
        ? `${learningLedgerRecords.length} records`
        : "Learning ledger records missing.",
    },
    {
      name: "Upgrade readiness flags are enabled",
      passed: Object.values(engine.upgradeReadiness).every(Boolean),
      detail: JSON.stringify(engine.upgradeReadiness),
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v15.7 Phase 177",
    service: "Self-Improvement Smoke Test API",
    engineEndpoint: "/api/sovereign/self-improvement-engine",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    engineCount: engine.engines.length,
    guardrailCount: engine.productionGuardrails.length,
    releaseStepCount: engine.requiredReleaseSequence.length,
    checks,
  });
}
