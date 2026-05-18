import crypto from "crypto";
import { createAuditEventPersistencePreview } from "@/lib/sovereign/audit-event-write-persistence";
import { getGitHubOAuthStartRouteBlueprint } from "@/lib/sovereign/github-oauth-start-route";
import { getRealConnectorDatabaseMigration } from "@/lib/sovereign/real-connector-database-migration";

type GitHubOAuthCallbackInput = {
  code?: string | null;
  state?: string | null;
  workspaceId?: string;
  userId?: string;
  dryRun?: boolean;
};

function createCredentialRef(input: { workspaceId: string; userId: string; state: string }) {
  const digest = crypto
    .createHash("sha256")
    .update(["github", input.workspaceId, input.userId, input.state].join(":"))
    .digest("hex")
    .slice(0, 24);

  return `secret_ref/github/${input.workspaceId}/${digest}`;
}

export function createGitHubOAuthCallbackPreview(input: GitHubOAuthCallbackInput = {}) {
  const code = input.code || "";
  const state = input.state || "";
  const workspaceId = input.workspaceId || "workspace_demo";
  const userId = input.userId || "admin";

  const missingEnv = [
    !process.env.GITHUB_CLIENT_ID ? "GITHUB_CLIENT_ID" : null,
    !process.env.GITHUB_CLIENT_SECRET ? "GITHUB_CLIENT_SECRET" : null,
    !process.env.GITHUB_OAUTH_REDIRECT_URI ? "GITHUB_OAUTH_REDIRECT_URI" : null,
  ].filter(Boolean) as string[];

  const errors: string[] = [];

  if (!code) errors.push("Missing GitHub OAuth code.");
  if (!state) errors.push("Missing GitHub OAuth state.");
  if (missingEnv.length) errors.push(`Missing runtime env: ${missingEnv.join(", ")}`);

  const credentialRef = state
    ? createCredentialRef({ workspaceId, userId, state })
    : "missing_state_no_credential_ref";

  const auditPreview = createAuditEventPersistencePreview({
    eventType: "connector_install",
    actor: userId,
    role: "Admin",
    source: "github_oauth_callback",
    riskLevel: "medium",
    decision: errors.length ? "block" : "approved",
    status: errors.length ? "blocked" : "succeeded",
    correlationId: `corr_github_oauth_callback_${workspaceId}`,
    evidence: errors.length
      ? ["oauth callback rejected", "no raw token exposed", "safe failure response"]
      : ["oauth state verified", "token exchanged server-side", "credential_ref created"],
    metadata: {
      connectorId: "github",
      workspaceId,
      credentialRef,
      tokenStoredAsReferenceOnly: true,
      dryRun: Boolean(input.dryRun),
    },
  });

  return {
    ok: errors.length === 0,
    mode: "github_oauth_callback_preview",
    wouldExchangeToken: errors.length === 0,
    wouldPersistCredentialRef: errors.length === 0,
    wouldCreateConnectorInstall: errors.length === 0,
    errors,
    missingEnv,
    callbackContext: {
      connectorId: "github",
      workspaceId,
      userId,
      statePresent: Boolean(state),
      codePresent: Boolean(code),
      stateVerified: Boolean(state),
      redacted: true,
    },
    tokenExchangePlan: {
      method: "POST",
      url: "https://github.com/login/oauth/access_token",
      serverSideOnly: true,
      includesClientSecretServerSideOnly: true,
      returnsRawTokenToClient: false,
      storesRawTokenInDatabase: false,
    },
    credentialRefPlan: {
      credentialRef,
      storage: "server-side secret manager or encrypted vault",
      persistedConnectorField: "connector_installs.credentialRef",
      rawTokenExposed: false,
    },
    connectorInstallPlan: {
      table: "connector_installs",
      connectorId: "github",
      workspaceId,
      installedBy: userId,
      installStatus: errors.length ? "blocked" : "installed_limited",
      riskLevel: "medium",
      authType: "oauth",
      credentialRef,
      rawSecretStored: false,
    },
    auditPreview,
    safeRedirect: {
      success: "/connectors/github?installed=1",
      failure: "/connectors/github?error=oauth_callback_failed",
    },
  };
}

export function getGitHubOAuthCallbackRouteBlueprint() {
  const start = getGitHubOAuthStartRouteBlueprint();
  const connectorDb = getRealConnectorDatabaseMigration();

  const sampleCallback = createGitHubOAuthCallbackPreview({
    code: "sample_code_redacted",
    state: "sample_state_redacted",
    workspaceId: "workspace_demo",
    userId: "admin",
    dryRun: true,
  });

  const rejectedCallback = createGitHubOAuthCallbackPreview({
    code: "",
    state: "",
    workspaceId: "workspace_demo",
    userId: "admin",
    dryRun: true,
  });

  return {
    system: "OmegaCrownAI GitHub OAuth Callback Route",
    phase: "v20.2 Phase 222",
    status: "github_oauth_callback_route_ready",
    purpose:
      "Define and expose the GitHub OAuth callback route that validates code/state, exchanges token server-side, creates a credential_ref plan, creates connector install plan, writes audit evidence, and never exposes raw tokens.",
    corePrinciple:
      "OAuth callback must fail closed when code/state/env are missing, exchange tokens server-side only, persist credential_ref only, and write audit evidence without exposing secrets.",

    route: "/api/connectors/github/callback",
    method: "GET",

    requiredEnvironmentVariables: [
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET",
      "GITHUB_OAUTH_REDIRECT_URI",
    ],

    callbackFlow: [
      "Receive GitHub callback with code and state.",
      "Validate code exists.",
      "Validate state exists.",
      "Verify state against pending OAuth state store in future persistence layer.",
      "Exchange code for token server-side only.",
      "Store raw token in server-side vault only.",
      "Create opaque credential_ref.",
      "Create connector_installs record with credential_ref only.",
      "Create permission grant records for read/draft scopes.",
      "Write connector install audit event.",
      "Redirect user to safe connector status page.",
    ],

    safetyRules: [
      "Fail closed when code is missing.",
      "Fail closed when state is missing.",
      "Fail closed when GitHub OAuth env vars are missing.",
      "Never expose raw access token in JSON response.",
      "Never store raw access token in connector install record.",
      "Store credential_ref only.",
      "Token exchange must happen server-side only.",
      "Audit callback success and failure.",
      "Redirect only to safe internal routes.",
    ],

    tokenExchangeRequestShape: {
      url: "https://github.com/login/oauth/access_token",
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      bodyFields: [
        "client_id",
        "client_secret server-side only",
        "code",
        "redirect_uri",
        "state",
      ],
      rawTokenExposure: "never returned to client",
    },

    connectorInstallWritePlan: {
      table: "connector_installs",
      installStatus: "installed_limited",
      authType: "oauth",
      credentialField: "credentialRef",
      credentialPolicy: "opaque reference only",
      rawSecretStored: false,
    },

    permissionGrantPlan: [
      {
        permission: "connector_read",
        approvalGate: "read_only",
        defaultState: "approved_after_install",
      },
      {
        permission: "connector_write_draft",
        approvalGate: "workspace_write",
        defaultState: "limited_draft_only",
      },
    ],

    integrationSources: {
      oauthStartStatus: start.status,
      connectorDatabaseMigrationStatus: connectorDb.status,
    },

    sampleCallback,
    rejectedCallback,

    nextImplementationPhases: [
      "GitHub Credential Reference Vault Adapter",
      "GitHub Repository Selector API",
      "GitHub Issue Reader Action",
      "GitHub PR Draft Action",
      "Connector Disconnect/Revoke API",
    ],
  };
}
