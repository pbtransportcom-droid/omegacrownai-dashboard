export function getGovernancePermissionsAuditLayer() {
  return {
    system: "OmegaCrownAI Governance, Permissions & Audit Trail Layer",
    phase: "v17.1 Phase 191",
    status: "governance_ready",
    purpose:
      "Define how OmegaCrownAI controls who can execute actions, what actions are allowed, what must be approved, and how every high-value action is audited.",
    corePrinciple:
      "No sovereign execution without permissions, approval gates, audit trail, and reviewable accountability.",

    roles: [
      {
        role: "Owner",
        permissions: [
          "approve_high_risk_actions",
          "manage_governance_rules",
          "approve_deployments",
          "review_audit_trails",
          "manage_billing_and_customer_rules",
        ],
      },
      {
        role: "Admin",
        permissions: [
          "manage_projects",
          "approve_medium_risk_actions",
          "review_outputs",
          "run_smoke_tests",
          "manage_workspace_settings",
        ],
      },
      {
        role: "Builder Agent",
        permissions: [
          "generate_artifacts",
          "create_files",
          "prepare_downloads",
          "run_validation",
        ],
      },
      {
        role: "Execution Agent",
        permissions: [
          "run_dry_runs",
          "prepare_execution_plan",
          "run_build_after_approval",
          "record_execution_audit",
        ],
      },
      {
        role: "Governance Agent",
        permissions: [
          "evaluate_policy",
          "classify_risk",
          "block_unsafe_actions",
          "require_human_review",
        ],
      },
      {
        role: "Viewer",
        permissions: [
          "read_project",
          "preview_artifacts",
          "view_status",
        ],
      },
    ],

    permissionGraph: [
      {
        permission: "generate_artifacts",
        allowedRoles: ["Owner", "Admin", "Builder Agent"],
        riskLevel: "medium",
      },
      {
        permission: "run_smoke_tests",
        allowedRoles: ["Owner", "Admin", "Builder Agent", "Execution Agent"],
        riskLevel: "low",
      },
      {
        permission: "approve_deployments",
        allowedRoles: ["Owner"],
        riskLevel: "high",
      },
      {
        permission: "run_build_after_approval",
        allowedRoles: ["Owner", "Admin", "Execution Agent"],
        riskLevel: "high",
      },
      {
        permission: "manage_governance_rules",
        allowedRoles: ["Owner", "Governance Agent"],
        riskLevel: "high",
      },
      {
        permission: "block_unsafe_actions",
        allowedRoles: ["Owner", "Governance Agent"],
        riskLevel: "blocked_by_default",
      },
    ],

    approvalGates: [
      {
        gate: "read_only",
        examples: ["view status", "read smoke test", "open JSON report"],
        requirement: "automatic",
      },
      {
        gate: "artifact_generation",
        examples: ["generate website bundle", "generate trading starter", "create README"],
        requirement: "validate output before customer-ready label",
      },
      {
        gate: "workspace_write",
        examples: ["edit project file", "create project artifact", "save memory record"],
        requirement: "scoped permission and audit record",
      },
      {
        gate: "production_change",
        examples: ["build app", "restart PM2", "deploy route", "push production commit"],
        requirement: "build success, route smoke test, targeted git add, PM2 log review",
      },
      {
        gate: "external_write",
        examples: ["send email", "write CRM record", "publish asset", "activate automation"],
        requirement: "explicit approval and rollback/recovery plan",
      },
      {
        gate: "blocked_by_default",
        examples: ["live trading", "delete customer data", "expose secrets", "payment movement"],
        requirement: "blocked unless separately unlocked by owner review",
      },
    ],

    auditTrailRecordShape: {
      auditId: "stable unique audit identifier",
      actor: "user or agent performing action",
      role: "role used for action",
      action: "registered action name",
      permissionUsed: "permission required",
      riskLevel: "low | medium | high | blocked_by_default",
      approvalGate: "approval gate name",
      sourcePromptHash: "hash of triggering request when available",
      inputHash: "hash of inputs",
      outputHash: "hash of outputs",
      status: "planned | approved | executed | failed | rolled_back | blocked",
      errorClass: "optional error class",
      rollbackAvailable: "boolean",
      timestamp: "ISO timestamp",
      evidence: [
        "build result",
        "smoke test result",
        "route status",
        "commit hash",
        "PM2 log result",
      ],
    },

    blockedActionRules: [
      "Do not expose secrets, API keys, passwords, tokens, or private credentials.",
      "Do not enable live trading by default.",
      "Do not delete user/customer data without explicit owner approval and rollback plan.",
      "Do not mark output customer-ready without validation evidence.",
      "Do not restart PM2 after failed build.",
      "Do not use git add . for production changes.",
      "Do not execute external writes without approval gate.",
      "Do not store inferred facts as verified memory.",
    ],

    complianceHooks: [
      {
        hook: "privacy_review",
        appliesTo: ["forms", "customer data", "CRM", "email", "analytics"],
        requirement: "identify personal data, consent needs, retention, and deletion path",
      },
      {
        hook: "security_review",
        appliesTo: ["auth", "secrets", "API keys", "webhooks", "deployment"],
        requirement: "check secret exposure, scopes, logs, and least-privilege access",
      },
      {
        hook: "financial_risk_review",
        appliesTo: ["trading", "payments", "billing", "invoices"],
        requirement: "block irreversible or real-money actions without owner approval",
      },
      {
        hook: "customer_ready_review",
        appliesTo: ["paid artifacts", "downloads", "deployments", "launches"],
        requirement: "verify full-function standard, smoke test, README, preview, and next action",
      },
    ],

    productionGovernanceRules: [
      "Build must pass before PM2 restart.",
      "Route smoke checks must pass after restart.",
      "PM2 logs must be checked after restart.",
      "Only targeted files may be added to git.",
      "Untracked runtime uploads should not be committed accidentally.",
      "Every deployment should have a rollback/recovery note.",
      "Every customer-ready claim should link validation evidence.",
    ],

    nextImplementationPhases: [
      "Governance API",
      "Governance Smoke Test API",
      "Permission Graph UI",
      "Audit Trail Storage",
      "Approval Gate UI",
      "Blocked Action Guard",
      "Compliance Review Hooks",
    ],
  };
}
