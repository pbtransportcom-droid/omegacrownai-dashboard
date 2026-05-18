import { NextResponse } from "next/server";
import { getGitHubConnectorBlueprint } from "@/lib/sovereign/github-connector-blueprint";

export async function GET() {
  const github = getGitHubConnectorBlueprint();

  const actionIds = github.manifest.actions.map((action) => action.actionId);

  const checks = [
    {
      name: "GitHub blueprint is ready",
      passed: github.status === "github_connector_blueprint_ready",
      detail: github.status,
    },
    {
      name: "Manifest validation passes",
      passed: github.validation.ok === true,
      detail: github.validation.ok ? "Manifest valid." : github.validation.errors.join(", "),
    },
    {
      name: "Read repository action present",
      passed: actionIds.includes("github.read_repository"),
      detail: `${actionIds.length} actions`,
    },
    {
      name: "Issue reader action present",
      passed: actionIds.includes("github.read_issues"),
      detail: `${actionIds.length} actions`,
    },
    {
      name: "PR draft action present",
      passed: actionIds.includes("github.prepare_pull_request"),
      detail: `${actionIds.length} actions`,
    },
    {
      name: "Read action allowed",
      passed: github.permissionGateExamples.readDecision.decision === "allow",
      detail: github.permissionGateExamples.readDecision.decision,
    },
    {
      name: "Draft action allowed",
      passed: github.permissionGateExamples.draftDecision.decision === "allow",
      detail: github.permissionGateExamples.draftDecision.decision,
    },
    {
      name: "Unsafe write requires approval",
      passed: github.permissionGateExamples.unsafeWriteDecision.decision === "require_approval",
      detail: github.permissionGateExamples.unsafeWriteDecision.decision,
    },
    {
      name: "Blocked GitHub actions listed",
      passed: github.blockedByDefaultGitHubActions.length >= 8,
      detail: `${github.blockedByDefaultGitHubActions.length} blocked actions`,
    },
    {
      name: "Audit records present",
      passed: Object.keys(github.auditRecords).length >= 3,
      detail: `${Object.keys(github.auditRecords).length} audit records`,
    },
    {
      name: "Install review checklist present",
      passed: github.installReviewChecklist.length >= 8,
      detail: `${github.installReviewChecklist.length} checklist items`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v17.9 Phase 199",
    service: "GitHub Connector Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    actionCount: github.manifest.actions.length,
    blockedActionCount: github.blockedByDefaultGitHubActions.length,
    auditRecordCount: Object.keys(github.auditRecords).length,
    installReviewChecklistCount: github.installReviewChecklist.length,
    manifestScore: github.validation.score,
    checks,
  });
}
