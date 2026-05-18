import { NextResponse } from "next/server";
import {
  createGitHubVaultReadPreview,
  createGitHubVaultRevokePreview,
  createGitHubVaultWritePreview,
  getGitHubCredentialVaultAdapter,
} from "@/lib/sovereign/github-credential-vault-adapter";

const requiredVaultRules = [
  "Raw GitHub OAuth tokens may only be stored in a server-side secret manager or encrypted vault.",
  "connector_installs may store credentialRef only.",
  "Do not store raw OAuth tokens in database tables.",
  "Do not return raw OAuth tokens to the browser.",
  "Do not include raw OAuth tokens in logs.",
  "Do not include raw OAuth tokens in audit exports.",
  "Read token only inside server-side connector execution.",
  "Revoke or disable credentialRef on disconnect.",
];

const requiredBlockedExposure = [
  "raw OAuth token",
  "refresh token",
  "GitHub client secret",
  "authorization header",
  "private key",
  "webhook secret",
];

export async function GET() {
  const adapter = getGitHubCredentialVaultAdapter();

  const writePreview = createGitHubVaultWritePreview({
    workspaceId: "workspace_demo",
    userId: "admin",
    providerAccountId: "github_user_demo",
  });

  const readPreview = createGitHubVaultReadPreview({
    workspaceId: "workspace_demo",
    userId: "admin",
    providerAccountId: "github_user_demo",
  });

  const revokePreview = createGitHubVaultRevokePreview({
    workspaceId: "workspace_demo",
    userId: "admin",
    providerAccountId: "github_user_demo",
  });

  const missingRules = requiredVaultRules.filter(
    (rule) => !adapter.vaultStorageRules.includes(rule)
  );

  const missingBlockedExposure = requiredBlockedExposure.filter(
    (item) => !adapter.blockedClientExposure.includes(item)
  );

  const checks = [
    {
      name: "GitHub credential vault adapter is ready",
      passed: adapter.status === "github_credential_vault_adapter_ready",
      detail: adapter.status,
    },
    {
      name: "Adapter actions present",
      passed: adapter.adapterActions.length >= 4,
      detail: `${adapter.adapterActions.length} adapter actions`,
    },
    {
      name: "Credential ref shape present",
      passed:
        Boolean(adapter.credentialRefShape.credentialRef) &&
        adapter.credentialRefShape.connectorId === "github" &&
        adapter.credentialRefShape.redacted === true,
      detail: "Credential ref shape defined.",
    },
    {
      name: "Vault storage rules present",
      passed: missingRules.length === 0,
      detail: missingRules.length ? `Missing: ${missingRules.join(", ")}` : "Core vault rules present.",
    },
    {
      name: "Write preview stores raw token only in vault",
      passed:
        writePreview.vaultWritePlan.rawTokenStoredInVaultOnly === true &&
        writePreview.vaultWritePlan.rawTokenStoredInConnectorTable === false &&
        writePreview.vaultWritePlan.rawTokenReturnedToClient === false,
      detail: "Write preview safe.",
    },
    {
      name: "Read preview is server-side only",
      passed:
        readPreview.serverSideOnly === true &&
        readPreview.clientVisible === false &&
        readPreview.rawTokenReturnedToClient === false,
      detail: "Read preview safe.",
    },
    {
      name: "Revoke preview disables credential ref",
      passed:
        revokePreview.revokePlan.credentialRefDisabled === true &&
        revokePreview.revokePlan.disconnectAuditRequired === true &&
        revokePreview.responseToClient.rawToken === "[NEVER_RETURNED]",
      detail: "Revoke preview safe.",
    },
    {
      name: "Callback integration plan present",
      passed: adapter.callbackIntegrationPlan.length >= 6,
      detail: `${adapter.callbackIntegrationPlan.length} callback steps`,
    },
    {
      name: "Disconnect integration plan present",
      passed: adapter.disconnectIntegrationPlan.length >= 6,
      detail: `${adapter.disconnectIntegrationPlan.length} disconnect steps`,
    },
    {
      name: "Blocked client exposure present",
      passed: missingBlockedExposure.length === 0,
      detail: missingBlockedExposure.length
        ? `Missing: ${missingBlockedExposure.join(", ")}`
        : "Client exposure blocked.",
    },
    {
      name: "Integration source statuses present",
      passed:
        adapter.integrationSources.callbackRouteStatus === "github_oauth_callback_route_ready" &&
        adapter.integrationSources.connectorDatabaseMigrationStatus === "connector_database_migration_blueprint_ready",
      detail: "Integration sources linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v20.3 Phase 223",
    service: "GitHub Credential Vault Adapter Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    adapterActionCount: adapter.adapterActions.length,
    vaultRuleCount: adapter.vaultStorageRules.length,
    callbackStepCount: adapter.callbackIntegrationPlan.length,
    disconnectStepCount: adapter.disconnectIntegrationPlan.length,
    blockedExposureCount: adapter.blockedClientExposure.length,
    writeStoresRawTokenInConnectorTable:
      writePreview.vaultWritePlan.rawTokenStoredInConnectorTable,
    readReturnsRawTokenToClient: readPreview.rawTokenReturnedToClient,
    revokeRequiresAudit: revokePreview.revokePlan.disconnectAuditRequired,
    checks,
  });
}
