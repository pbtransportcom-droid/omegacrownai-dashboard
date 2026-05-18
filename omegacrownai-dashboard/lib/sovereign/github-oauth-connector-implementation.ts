export function getGitHubOAuthConnectorImplementation() {
  return {
    system: "OmegaCrownAI GitHub OAuth Connector Implementation",
    phase: "v18.3 Phase 203",
    status: "github_oauth_blueprint_ready",
    purpose:
      "Define the real GitHub OAuth connector implementation path for installing GitHub safely with scoped access, state verification, credential references, repository selection, permission gates, and audit records.",
    corePrinciple:
      "GitHub OAuth must never expose raw tokens. OAuth installs should store only opaque credential references, validate state, scope access, run healthchecks, and route all actions through permission gates and audit trails.",

    requiredEnvironmentVariables: [
      {
        name: "GITHUB_CLIENT_ID",
        required: true,
        purpose: "GitHub OAuth app client id.",
      },
      {
        name: "GITHUB_CLIENT_SECRET",
        required: true,
        purpose: "GitHub OAuth app secret. Must stay server-side only.",
      },
      {
        name: "GITHUB_OAUTH_REDIRECT_URI",
        required: true,
        purpose: "OAuth callback URL, for example /api/connectors/github/callback.",
      },
      {
        name: "CONNECTOR_SECRET_KEY",
        required: true,
        purpose: "Used by secret/vault layer to reference encrypted connector credentials.",
      },
    ],

    oauthRoutes: [
      {
        route: "/api/connectors/github/start",
        method: "GET",
        purpose:
          "Creates OAuth state, stores pending install review context, and redirects to GitHub authorization.",
        requiredSafety: [
          "generate CSRF-resistant state",
          "bind state to workspace/user",
          "request least-privilege scopes",
          "do not include secrets in URL logs",
        ],
      },
      {
        route: "/api/connectors/github/callback",
        method: "GET",
        purpose:
          "Verifies state, exchanges code for token server-side, stores credential_ref, creates connector install record, and runs healthcheck.",
        requiredSafety: [
          "verify state",
          "exchange code server-side only",
          "never return raw token to client",
          "store credential_ref only",
          "create audit event",
        ],
      },
      {
        route: "/api/connectors/github/disconnect",
        method: "POST",
        purpose:
          "Revokes or disconnects GitHub access, updates install status, cleans cached metadata, and writes disconnect audit event.",
        requiredSafety: [
          "require authenticated owner/admin",
          "revoke provider token where possible",
          "remove credential_ref",
          "record disconnect audit",
        ],
      },
    ],

    requestedScopes: [
      {
        scope: "read:user",
        reason: "Verify GitHub user identity for connector install.",
      },
      {
        scope: "repo:read",
        reason: "Read selected repository metadata, issues, branches, and pull requests.",
      },
      {
        scope: "pull_request:write_draft",
        reason: "Future draft PR preparation only; no merge by default.",
      },
    ],

    installLifecycle: [
      "User opens connector install review.",
      "Manifest validator confirms GitHub connector manifest.",
      "Permission gate confirms read/draft install scope.",
      "OAuth start route creates state and redirects to GitHub.",
      "OAuth callback verifies state and exchanges code server-side.",
      "Credential vault stores token and returns credential_ref.",
      "Connector install store saves install record with credential_ref only.",
      "GitHub healthcheck verifies API access and selected repository permissions.",
      "Audit trail records install and healthcheck.",
      "Repository selector becomes available.",
    ],

    githubApiActions: [
      {
        actionId: "github.healthcheck",
        permission: "connector_read",
        gate: "read_only",
        endpoint: "GET /user and selected repo metadata",
        status: "planned",
      },
      {
        actionId: "github.list_repositories",
        permission: "connector_read",
        gate: "read_only",
        endpoint: "GET /user/repos or installation repositories",
        status: "planned",
      },
      {
        actionId: "github.read_issues",
        permission: "connector_read",
        gate: "read_only",
        endpoint: "GET /repos/{owner}/{repo}/issues",
        status: "planned",
      },
      {
        actionId: "github.prepare_pull_request",
        permission: "connector_write_draft",
        gate: "workspace_write",
        endpoint: "draft metadata only until write approval exists",
        status: "planned",
      },
    ],

    credentialRules: [
      "Never store raw GitHub OAuth token in connector install records.",
      "Never expose token in client-side code, logs, JSON responses, artifacts, or commits.",
      "Store token in server-side secret manager/encrypted vault only.",
      "Store only credential_ref in connector_installs.",
      "Disconnect must revoke token where possible.",
      "Healthchecks must not reveal token or private payloads.",
    ],

    permissionAndAuditIntegration: [
      "Every GitHub action calls Connector Permission Gate first.",
      "Every GitHub action creates Connector Audit Trail record.",
      "Read actions may run with read_only gate.",
      "Draft PR actions may run with workspace_write gate.",
      "Merge, direct push, release, deploy, secret changes, and destructive repo actions remain blocked by default.",
    ],

    repositorySelectorPlan: [
      "Show repositories available under installed GitHub scope.",
      "Allow user/admin to select specific repositories.",
      "Store selected repository ids/names as non-secret metadata.",
      "Do not automatically grant all repositories if least privilege is possible.",
      "Audit repository selection changes.",
    ],

    blockedByDefault: [
      "Direct push to main",
      "Merge pull request",
      "Delete branch",
      "Delete repository",
      "Create production release",
      "Deploy production environment",
      "Read or change repository secrets",
      "Change protected branch rules",
    ],

    nextImplementationSteps: [
      "Create GitHub OAuth start route",
      "Create GitHub OAuth callback route",
      "Create credential_ref placeholder/vault adapter",
      "Create GitHub healthcheck route",
      "Create repository selector API",
      "Persist connector install records in database",
    ],
  };
}
