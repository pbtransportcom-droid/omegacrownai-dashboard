import crypto from "crypto";
import { getGitHubOAuthConnectorImplementation } from "@/lib/sovereign/github-oauth-connector-implementation";
import { getRealConnectorDatabaseMigration } from "@/lib/sovereign/real-connector-database-migration";

type GitHubOAuthStartInput = {
  workspaceId?: string;
  userId?: string;
  returnTo?: string;
};

function createState(input: GitHubOAuthStartInput) {
  const seed = [
    input.workspaceId || "workspace_demo",
    input.userId || "admin",
    Date.now().toString(),
    crypto.randomBytes(16).toString("hex"),
  ].join(":");

  return crypto.createHash("sha256").update(seed).digest("hex");
}

export function createGitHubOAuthStartPreview(input: GitHubOAuthStartInput = {}) {
  const clientId = process.env.GITHUB_CLIENT_ID || "";
  const redirectUri =
    process.env.GITHUB_OAUTH_REDIRECT_URI ||
    "https://www.omegacrownai.com/api/connectors/github/callback";

  const workspaceId = input.workspaceId || "workspace_demo";
  const userId = input.userId || "admin";
  const state = createState({ workspaceId, userId });

  const scopes = ["read:user", "repo"];
  const params = new URLSearchParams({
    client_id: clientId || "missing_GITHUB_CLIENT_ID",
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    state,
    allow_signup: "true",
  });

  const authorizationUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  const missingEnv = [
    !clientId ? "GITHUB_CLIENT_ID" : null,
    !process.env.GITHUB_CLIENT_SECRET ? "GITHUB_CLIENT_SECRET" : null,
    !process.env.GITHUB_OAUTH_REDIRECT_URI ? "GITHUB_OAUTH_REDIRECT_URI" : null,
  ].filter(Boolean);

  return {
    ok: missingEnv.length === 0,
    mode: "github_oauth_start_preview",
    wouldRedirect: missingEnv.length === 0,
    missingEnv,
    stateRecord: {
      state,
      connectorId: "github",
      workspaceId,
      userId,
      returnTo: input.returnTo || "/connectors/github",
      status: "pending_callback",
      createdAt: new Date().toISOString(),
      expiresInMinutes: 15,
      redacted: true,
    },
    authorizationUrl,
    requestedScopes: scopes,
    safety: {
      clientSecretExposed: false,
      rawTokenExposed: false,
      stateBoundToWorkspace: true,
      stateBoundToUser: true,
      leastPrivilegeIntent: "read user identity and repository access for selected GitHub workflows",
      credentialStorage: "callback stores credential_ref only, never raw token in connector install records",
    },
  };
}

export function getGitHubOAuthStartRouteBlueprint() {
  const oauth = getGitHubOAuthConnectorImplementation();
  const connectorDb = getRealConnectorDatabaseMigration();
  const sampleStart = createGitHubOAuthStartPreview({
    workspaceId: "workspace_demo",
    userId: "admin",
    returnTo: "/connectors/github",
  });

  return {
    system: "OmegaCrownAI GitHub OAuth Start Route",
    phase: "v20.1 Phase 221",
    status: "github_oauth_start_route_ready",
    purpose:
      "Define and expose the GitHub OAuth start route that creates a CSRF-resistant state, binds install context to workspace/user, requests scoped GitHub access, and redirects to GitHub authorization without exposing secrets.",
    corePrinciple:
      "OAuth start must never expose client secrets or tokens. It should create state, bind context, request least-privilege scopes, and hand off safely to the callback route.",

    route: "/api/connectors/github/start",
    method: "GET",

    requiredEnvironmentVariables: [
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET",
      "GITHUB_OAUTH_REDIRECT_URI",
    ],

    startFlow: [
      "Receive workspace/user install request.",
      "Confirm GitHub connector manifest and install review context.",
      "Generate CSRF-resistant OAuth state.",
      "Bind state to workspaceId and userId.",
      "Store pending OAuth state context in future persistence layer.",
      "Build GitHub authorization URL with requested scopes.",
      "Redirect user to GitHub authorization.",
      "Callback route verifies state before token exchange.",
    ],

    requestedScopes: [
      {
        scope: "read:user",
        reason: "Verify GitHub user identity.",
      },
      {
        scope: "repo",
        reason:
          "Repository access for selected repo workflows. Future refinement should narrow scope where GitHub app installation permissions are used.",
      },
    ],

    safetyRules: [
      "Do not expose GITHUB_CLIENT_SECRET in URL, logs, client response, or UI.",
      "Do not request token in start route.",
      "Do not store raw token in connector install records.",
      "State must be bound to workspace and user.",
      "State must expire.",
      "Authorization URL must use configured redirect URI.",
      "Callback route must verify state before token exchange.",
      "Credential persistence must store credential_ref only.",
    ],

    pendingStateRecordShape: {
      state: "sha256 state value",
      connectorId: "github",
      workspaceId: "workspace or tenant id",
      userId: "installing user/admin id",
      returnTo: "safe return route",
      status: "pending_callback | consumed | expired | rejected",
      createdAt: "ISO timestamp",
      expiresAt: "ISO timestamp",
      redacted: true,
    },

    integrationSources: {
      githubOAuthBlueprintStatus: oauth.status,
      connectorDatabaseMigrationStatus: connectorDb.status,
    },

    sampleStart,

    nextImplementationPhases: [
      "GitHub OAuth Callback Route",
      "GitHub Credential Reference Vault Adapter",
      "GitHub Repository Selector API",
      "GitHub Issue Reader Action",
      "GitHub PR Draft Action",
      "Connector Disconnect/Revoke API",
    ],
  };
}
