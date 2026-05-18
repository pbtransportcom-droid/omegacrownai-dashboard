import { createConnectorAuditRecord } from "@/lib/sovereign/connector-audit-trail";
import { evaluateConnectorPermissionGate } from "@/lib/sovereign/connector-permission-gate";
import { validateConnectorManifest } from "@/lib/sovereign/connector-manifest-validator";

export function getGitHubConnectorManifest() {
  return {
    connectorId: "github",
    name: "GitHub",
    category: "development",
    version: "0.1.0",
    authType: "oauth",
    permissionsRequested: ["connector_read", "connector_write_draft"],
    riskLevel: "medium",
    actions: [
      {
        actionId: "github.read_repository",
        name: "Read repository metadata",
        inputSchema: "owner, repo",
        outputSchema: "repository metadata, default branch, latest commit summary",
        approvalGate: "read_only",
        auditRequired: true,
      },
      {
        actionId: "github.read_issues",
        name: "Read GitHub issues",
        inputSchema: "owner, repo, labels, state",
        outputSchema: "issue list with ids, titles, states, labels",
        approvalGate: "read_only",
        auditRequired: true,
      },
      {
        actionId: "github.prepare_branch",
        name: "Prepare branch plan",
        inputSchema: "owner, repo, baseBranch, branchName, purpose",
        outputSchema: "branch plan and safety checklist",
        approvalGate: "workspace_write",
        auditRequired: true,
      },
      {
        actionId: "github.prepare_pull_request",
        name: "Prepare pull request draft",
        inputSchema: "owner, repo, branch, title, body, changedFiles",
        outputSchema: "pull request draft metadata",
        approvalGate: "workspace_write",
        auditRequired: true,
      },
      {
        actionId: "github.prepare_release_notes",
        name: "Prepare release notes draft",
        inputSchema: "owner, repo, commits, milestone, version",
        outputSchema: "release notes draft",
        approvalGate: "workspace_write",
        auditRequired: true,
      }
    ],
    healthcheck: "Verify GitHub OAuth scopes, repository access, rate limit, and API availability.",
    disconnectPolicy: "Revoke OAuth token and remove cached repository metadata.",
    dataRetentionPolicy: "Store only minimal issue, PR, branch, and release metadata required for workflow review.",
  };
}

export function getGitHubConnectorBlueprint() {
  const manifest = getGitHubConnectorManifest();
  const validation = validateConnectorManifest(manifest);

  const readDecision = evaluateConnectorPermissionGate({
    connectorId: "github",
    actionId: "github.read_issues",
    permission: "connector_read",
    requestedGate: "read_only",
    riskLevel: "low",
    userApproved: false,
    hasAuditContext: true,
  });

  const draftDecision = evaluateConnectorPermissionGate({
    connectorId: "github",
    actionId: "github.prepare_pull_request",
    permission: "connector_write_draft",
    requestedGate: "workspace_write",
    riskLevel: "medium",
    userApproved: false,
    hasAuditContext: true,
  });

  const unsafeWriteDecision = evaluateConnectorPermissionGate({
    connectorId: "github",
    actionId: "github.merge_pull_request",
    permission: "connector_external_write",
    requestedGate: "external_write",
    riskLevel: "high",
    userApproved: false,
    hasAuditContext: true,
  });

  const auditRecords = {
    readRepository: createConnectorAuditRecord({
      connectorId: "github",
      actionId: "github.read_repository",
      permission: "connector_read",
      requestedGate: "read_only",
      riskLevel: "low",
      hasAuditContext: true,
      actor: "admin",
      role: "Admin",
      rollbackNote: "Read-only action; rollback not required.",
    }),
    preparePullRequest: createConnectorAuditRecord({
      connectorId: "github",
      actionId: "github.prepare_pull_request",
      permission: "connector_write_draft",
      requestedGate: "workspace_write",
      riskLevel: "medium",
      hasAuditContext: true,
      actor: "admin",
      role: "Builder Agent",
      rollbackNote: "Draft-only PR preparation; no merge or direct production write.",
    }),
    blockedMerge: createConnectorAuditRecord({
      connectorId: "github",
      actionId: "github.merge_pull_request",
      permission: "connector_external_write",
      requestedGate: "external_write",
      riskLevel: "high",
      userApproved: false,
      hasAuditContext: true,
      actor: "admin",
      role: "Owner",
      rollbackNote: "Merge/push actions require explicit owner approval and rollback plan.",
    }),
  };

  return {
    system: "OmegaCrownAI GitHub Connector Blueprint",
    phase: "v17.9 Phase 199",
    status: "github_connector_blueprint_ready",
    purpose:
      "Define the first governed development connector for GitHub repository reading, issue review, branch planning, PR draft preparation, release-note drafting, audit trail, and permission-gated safety.",
    corePrinciple:
      "GitHub connector actions should begin read-only and draft-only. Direct merges, pushes, releases, deployments, or destructive repo actions require explicit approval, audit, and rollback context.",
    manifest,
    validation,
    supportedWorkflows: [
      "Read repository metadata",
      "Read issues and labels",
      "Prepare branch plan",
      "Prepare pull request draft",
      "Prepare release notes draft",
      "Record audit trail for every connector action",
      "Block direct merge/push/deploy actions by default",
    ],
    blockedByDefaultGitHubActions: [
      "Direct push to main",
      "Merge pull request",
      "Delete branch",
      "Delete repository",
      "Create production release",
      "Deploy production environment",
      "Change repository secrets",
      "Change protected branch rules",
    ],
    permissionGateExamples: {
      readDecision,
      draftDecision,
      unsafeWriteDecision,
    },
    auditRecords,
    requiredScopes: [
      {
        scope: "repo:read",
        reason: "Read repository metadata, issues, branches, and PR information.",
      },
      {
        scope: "pull_request:draft",
        reason: "Prepare PR drafts or metadata without merging.",
      },
      {
        scope: "repo:write",
        reason: "High-risk future scope; blocked by default until owner approval.",
      },
    ],
    installReviewChecklist: [
      "Confirm GitHub connector identity.",
      "Confirm OAuth scopes are least-privilege.",
      "Confirm repository access is limited to selected repos.",
      "Confirm actions are read/draft by default.",
      "Confirm direct push/merge/release/deploy actions are blocked by default.",
      "Confirm audit trail records are created for every action.",
      "Confirm disconnect policy revokes OAuth token.",
      "Confirm no GitHub tokens are exposed in logs, UI, commits, or artifacts.",
    ],
    nextImplementationSteps: [
      "GitHub OAuth configuration",
      "Repository selector UI",
      "Issue reader action",
      "Pull request draft action",
      "Connector action audit persistence",
      "Owner approval gate for write actions",
    ],
  };
}
