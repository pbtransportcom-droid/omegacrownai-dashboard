import { NextResponse } from "next/server";
import { getGovernancePermissionsAuditLayer } from "@/lib/sovereign/governance-permissions-audit";

const requiredRoles = [
  "Owner",
  "Admin",
  "Builder Agent",
  "Execution Agent",
  "Governance Agent",
  "Viewer",
];

const requiredApprovalGates = [
  "read_only",
  "artifact_generation",
  "workspace_write",
  "production_change",
  "external_write",
  "blocked_by_default",
];

const requiredBlockedRules = [
  "Do not expose secrets, API keys, passwords, tokens, or private credentials.",
  "Do not enable live trading by default.",
  "Do not restart PM2 after failed build.",
  "Do not use git add . for production changes.",
];

const requiredProductionRules = [
  "Build must pass before PM2 restart.",
  "Route smoke checks must pass after restart.",
  "Only targeted files may be added to git.",
  "Untracked runtime uploads should not be committed accidentally.",
];

export async function GET() {
  const governance = getGovernancePermissionsAuditLayer();

  const roleNames = governance.roles.map((item) => item.role);
  const gateNames = governance.approvalGates.map((item) => item.gate);

  const missingRoles = requiredRoles.filter((item) => !roleNames.includes(item));
  const missingGates = requiredApprovalGates.filter((item) => !gateNames.includes(item));
  const missingBlockedRules = requiredBlockedRules.filter(
    (item) => !governance.blockedActionRules.includes(item)
  );
  const missingProductionRules = requiredProductionRules.filter(
    (item) => !governance.productionGovernanceRules.includes(item)
  );

  const checks = [
    {
      name: "Governance layer is ready",
      passed: governance.status === "governance_ready",
      detail: governance.status,
    },
    {
      name: "Required roles present",
      passed: missingRoles.length === 0,
      detail: missingRoles.length ? `Missing: ${missingRoles.join(", ")}` : "All required roles present.",
    },
    {
      name: "Permission graph present",
      passed: governance.permissionGraph.length >= 6,
      detail: `${governance.permissionGraph.length} permission edges`,
    },
    {
      name: "Approval gates present",
      passed: missingGates.length === 0,
      detail: missingGates.length ? `Missing: ${missingGates.join(", ")}` : "All approval gates present.",
    },
    {
      name: "Audit trail record shape present",
      passed: Boolean(
        governance.auditTrailRecordShape.auditId &&
          governance.auditTrailRecordShape.actor &&
          governance.auditTrailRecordShape.permissionUsed &&
          governance.auditTrailRecordShape.evidence.length >= 5
      ),
      detail: "Audit record schema defined.",
    },
    {
      name: "Blocked action rules present",
      passed: missingBlockedRules.length === 0,
      detail: missingBlockedRules.length
        ? `Missing: ${missingBlockedRules.join(", ")}`
        : "Core blocked rules present.",
    },
    {
      name: "Compliance hooks present",
      passed: governance.complianceHooks.length >= 4,
      detail: `${governance.complianceHooks.length} compliance hooks`,
    },
    {
      name: "Production governance rules present",
      passed: missingProductionRules.length === 0,
      detail: missingProductionRules.length
        ? `Missing: ${missingProductionRules.join(", ")}`
        : "Core production governance rules present.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v17.1 Phase 191",
    service: "Governance Permissions Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    roleCount: governance.roles.length,
    permissionEdgeCount: governance.permissionGraph.length,
    approvalGateCount: governance.approvalGates.length,
    blockedRuleCount: governance.blockedActionRules.length,
    complianceHookCount: governance.complianceHooks.length,
    productionRuleCount: governance.productionGovernanceRules.length,
    checks,
  });
}
