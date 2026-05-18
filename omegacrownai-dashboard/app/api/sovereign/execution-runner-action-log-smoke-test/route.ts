import { NextResponse } from "next/server";
import { getExecutionRunnerPersistentActionLog } from "@/lib/sovereign/execution-runner-persistent-action-log";

const requiredTables = [
  "execution_action_runs",
  "execution_action_payloads",
  "execution_action_evidence",
  "execution_action_errors",
  "execution_action_rollbacks",
];

const requiredRunModes = [
  "plan_only",
  "dry_run",
  "sandbox_run",
  "approved_live_run",
  "blocked",
  "rolled_back",
];

const requiredStatuses = [
  "planned",
  "queued",
  "running",
  "succeeded",
  "failed",
  "blocked",
  "cancelled",
  "rolled_back",
  "needs_review",
];

const requiredProductionRules = [
  "No PM2 restart action may run unless build action succeeded.",
  "No deployment action may be marked succeeded without route smoke checks.",
  "No connector external write may run without permission gate allow/approval and audit context.",
  "No action log may store raw secrets.",
  "No uncontrolled git add . action.",
];

export async function GET() {
  const actionLog = getExecutionRunnerPersistentActionLog();

  const tableNames = actionLog.tables.map((table) => table.name);
  const missingTables = requiredTables.filter((table) => !tableNames.includes(table));
  const missingRunModes = requiredRunModes.filter((mode) => !actionLog.runModes.includes(mode));
  const missingStatuses = requiredStatuses.filter((status) => !actionLog.actionStatuses.includes(status));
  const missingProductionRules = requiredProductionRules.filter(
    (rule) => !actionLog.productionSafetyRules.includes(rule)
  );

  const checks = [
    {
      name: "Action log blueprint is ready",
      passed: actionLog.status === "action_log_blueprint_ready",
      detail: actionLog.status,
    },
    {
      name: "Required action log tables present",
      passed: missingTables.length === 0,
      detail: missingTables.length ? `Missing: ${missingTables.join(", ")}` : "All required tables present.",
    },
    {
      name: "Run modes present",
      passed: missingRunModes.length === 0,
      detail: missingRunModes.length ? `Missing: ${missingRunModes.join(", ")}` : "All run modes present.",
    },
    {
      name: "Action statuses present",
      passed: missingStatuses.length === 0,
      detail: missingStatuses.length ? `Missing: ${missingStatuses.join(", ")}` : "All statuses present.",
    },
    {
      name: "Execution categories present",
      passed: actionLog.executionCategories.length >= 9,
      detail: `${actionLog.executionCategories.length} execution categories`,
    },
    {
      name: "Error classes present",
      passed: actionLog.errorClasses.length >= 9,
      detail: `${actionLog.errorClasses.length} error classes`,
    },
    {
      name: "Replay rules present",
      passed: actionLog.replayRules.length >= 8,
      detail: `${actionLog.replayRules.length} replay rules`,
    },
    {
      name: "Production safety rules present",
      passed: missingProductionRules.length === 0,
      detail: missingProductionRules.length
        ? `Missing: ${missingProductionRules.join(", ")}`
        : "Core production safety rules present.",
    },
    {
      name: "Sample action runs present",
      passed: actionLog.sampleActionRuns.length >= 4,
      detail: `${actionLog.sampleActionRuns.length} sample action runs`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v18.4 Phase 204",
    service: "Execution Runner Persistent Action Log Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    tableCount: actionLog.tables.length,
    runModeCount: actionLog.runModes.length,
    approvalStatusCount: actionLog.approvalStatuses.length,
    actionStatusCount: actionLog.actionStatuses.length,
    executionCategoryCount: actionLog.executionCategories.length,
    errorClassCount: actionLog.errorClasses.length,
    replayRuleCount: actionLog.replayRules.length,
    productionSafetyRuleCount: actionLog.productionSafetyRules.length,
    sampleActionRunCount: actionLog.sampleActionRuns.length,
    checks,
  });
}
