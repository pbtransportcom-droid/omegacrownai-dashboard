import crypto from "crypto";
import { getGitHubOAuthCallbackRouteBlueprint } from "@/lib/sovereign/github-oauth-callback-route";
import { getRealConnectorDatabaseMigration } from "@/lib/sovereign/real-connector-database-migration";

type CredentialVaultInput = {
  workspaceId?: string;
  userId?: string;
  connectorId?: string;
  providerAccountId?: string;
  tokenHashSeed?: string;
};

function stableHash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function createGitHubCredentialRef(input: CredentialVaultInput = {}) {
  const workspaceId = input.workspaceId || "workspace_demo";
  const userId = input.userId || "admin";
  const connectorId = input.connectorId || "github";
  const providerAccountId = input.providerAccountId || "github_user_demo";
  const seed = [
    connectorId,
    workspaceId,
    userId,
    providerAccountId,
    input.tokenHashSeed || "redacted_token_seed",
  ].join(":");

  const digest = stableHash(seed).slice(0, 24);

  return {
    credentialRef: `secret_ref/${connectorId}/${workspaceId}/${digest}`,
    credentialId: `cred_${digest}`,
    connectorId,
    workspaceId,
    userId,
    providerAccountId,
    redacted: true,
  };
}

export function createGitHubVaultWritePreview(input: CredentialVaultInput = {}) {
  const ref = createGitHubCredentialRef(input);

  return {
    ok: true,
    mode: "vault_write_blueprint_preview",
    action: "write_github_oauth_token_to_vault",
    credentialRef: ref.credentialRef,
    credentialId: ref.credentialId,
    vaultWritePlan: {
      provider: "server_side_secret_manager_or_encrypted_vault",
      writeMethod: "putSecret",
      secretPath: ref.credentialRef,
      rawTokenStoredInVaultOnly: true,
      rawTokenStoredInConnectorTable: false,
      rawTokenReturnedToClient: false,
      encryptedAtRestRequired: true,
      rotationSupported: true,
    },
    connectorInstallUpdatePlan: {
      table: "connector_installs",
      field: "credentialRef",
      value: ref.credentialRef,
      storesRawSecret: false,
    },
    metadataRecord: {
      credentialId: ref.credentialId,
      connectorId: ref.connectorId,
      workspaceId: ref.workspaceId,
      userId: ref.userId,
      providerAccountId: ref.providerAccountId,
      scopes: ["read:user", "repo"],
      tokenHash: stableHash(input.tokenHashSeed || "redacted_token_seed"),
      rawToken: "[REDACTED_NEVER_PERSIST_HERE]",
      createdAt: new Date().toISOString(),
      redacted: true,
    },
  };
}

export function createGitHubVaultReadPreview(input: CredentialVaultInput = {}) {
  const ref = createGitHubCredentialRef(input);

  return {
    ok: true,
    mode: "vault_read_blueprint_preview",
    action: "read_github_token_for_server_side_action",
    credentialRef: ref.credentialRef,
    serverSideOnly: true,
    clientVisible: false,
    rawTokenReturnedToClient: false,
    allowedUseCases: [
      "github.healthcheck",
      "github.list_repositories",
      "github.read_issues",
      "github.prepare_pull_request draft-only action",
    ],
    responseToClient: {
      credentialRef: ref.credentialRef,
      token: "[NEVER_RETURNED]",
      redacted: true,
    },
  };
}

export function createGitHubVaultRevokePreview(input: CredentialVaultInput = {}) {
  const ref = createGitHubCredentialRef(input);

  return {
    ok: true,
    mode: "vault_revoke_blueprint_preview",
    action: "revoke_github_credential_ref",
    credentialRef: ref.credentialRef,
    revokePlan: {
      providerRevokeAttempt: true,
      vaultSecretDisabledOrDeleted: true,
      connectorInstallStatus: "disconnected",
      credentialRefDisabled: true,
      disconnectAuditRequired: true,
    },
    responseToClient: {
      credentialRef: ref.credentialRef,
      rawToken: "[NEVER_RETURNED]",
      revoked: true,
      redacted: true,
    },
  };
}

export function getGitHubCredentialVaultAdapter() {
  const callback = getGitHubOAuthCallbackRouteBlueprint();
  const connectorDb = getRealConnectorDatabaseMigration();

  const sampleWrite = createGitHubVaultWritePreview({
    workspaceId: "workspace_demo",
    userId: "admin",
    providerAccountId: "github_user_demo",
  });

  const sampleRead = createGitHubVaultReadPreview({
    workspaceId: "workspace_demo",
    userId: "admin",
    providerAccountId: "github_user_demo",
  });

  const sampleRevoke = createGitHubVaultRevokePreview({
    workspaceId: "workspace_demo",
    userId: "admin",
    providerAccountId: "github_user_demo",
  });

  return {
    system: "OmegaCrownAI GitHub Credential Reference Vault Adapter",
    phase: "v20.3 Phase 223",
    status: "github_credential_vault_adapter_ready",
    purpose:
      "Define the credential reference vault adapter that stores GitHub OAuth tokens only in a server-side vault and persists only opaque credential_ref values in connector install records.",
    corePrinciple:
      "GitHub credentials must never be stored in connector tables, logs, UI, exports, or client responses. Only credential_ref, metadata references, hashes, and redacted status may be visible.",

    adapterActions: [
      {
        action: "createCredentialRef",
        purpose: "Create opaque credential_ref for a GitHub OAuth credential.",
      },
      {
        action: "writeTokenToVault",
        purpose: "Store raw token server-side only and return credential_ref.",
      },
      {
        action: "readTokenServerSide",
        purpose: "Read token only for approved server-side connector actions.",
      },
      {
        action: "revokeCredentialRef",
        purpose: "Disable/delete vault secret and mark connector install disconnected.",
      },
    ],

    credentialRefShape: {
      credentialRef: "secret_ref/github/{workspaceId}/{digest}",
      credentialId: "non-secret credential id",
      connectorId: "github",
      workspaceId: "tenant/workspace id",
      userId: "installing user id",
      providerAccountId: "GitHub account id or login reference",
      redacted: true,
    },

    vaultStorageRules: [
      "Raw GitHub OAuth tokens may only be stored in a server-side secret manager or encrypted vault.",
      "connector_installs may store credentialRef only.",
      "Do not store raw OAuth tokens in database tables.",
      "Do not return raw OAuth tokens to the browser.",
      "Do not include raw OAuth tokens in logs.",
      "Do not include raw OAuth tokens in audit exports.",
      "Store tokenHash only for verification/debug metadata.",
      "Read token only inside server-side connector execution.",
      "Revoke or disable credentialRef on disconnect.",
    ],

    callbackIntegrationPlan: [
      "OAuth callback exchanges GitHub code server-side.",
      "Callback passes raw token directly to vault adapter.",
      "Vault adapter stores token and returns credentialRef.",
      "Callback stores credentialRef in connector_installs.",
      "Callback writes audit event with credentialRef only.",
      "Callback response never includes raw token.",
    ],

    disconnectIntegrationPlan: [
      "Disconnect route loads credentialRef.",
      "Adapter attempts provider token revocation where supported.",
      "Adapter disables or deletes vault secret.",
      "Connector install status becomes disconnected.",
      "Disconnect event and audit event are written.",
      "Client receives redacted revoke result only.",
    ],

    allowedServerSideUseCases: [
      "GitHub connector healthcheck",
      "GitHub repository selector",
      "GitHub issue reader",
      "GitHub PR draft preparation",
      "GitHub disconnect/revoke",
    ],

    blockedClientExposure: [
      "raw OAuth token",
      "refresh token",
      "GitHub client secret",
      "authorization header",
      "private key",
      "webhook secret",
    ],

    integrationSources: {
      callbackRouteStatus: callback.status,
      connectorDatabaseMigrationStatus: connectorDb.status,
    },

    sampleWrite,
    sampleRead,
    sampleRevoke,

    nextImplementationPhases: [
      "GitHub Repository Selector API",
      "GitHub Issue Reader Action",
      "GitHub PR Draft Action",
      "Connector Disconnect/Revoke API",
      "Connector Marketplace UI Page",
    ],
  };
}
