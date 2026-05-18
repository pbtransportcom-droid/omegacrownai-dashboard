import { NextResponse } from "next/server";
import {
  createGitHubOAuthCallbackPreview,
  getGitHubOAuthCallbackRouteBlueprint,
} from "@/lib/sovereign/github-oauth-callback-route";

const requiredSafetyRules = [
  "Fail closed when code is missing.",
  "Fail closed when state is missing.",
  "Fail closed when GitHub OAuth env vars are missing.",
  "Never expose raw access token in JSON response.",
  "Never store raw access token in connector install record.",
  "Store credential_ref only.",
  "Token exchange must happen server-side only.",
  "Audit callback success and failure.",
  "Redirect only to safe internal routes.",
];

export async function GET() {
  const blueprint = getGitHubOAuthCallbackRouteBlueprint();

  const validPreview = createGitHubOAuthCallbackPreview({
    code: "sample_code_redacted",
    state: "sample_state_redacted",
    workspaceId: "workspace_demo",
    userId: "admin",
    dryRun: true,
  });

  const rejectedMissingCodeState = createGitHubOAuthCallbackPreview({
    code: "",
    state: "",
    workspaceId: "workspace_demo",
    userId: "admin",
    dryRun: true,
  });

  const missingSafetyRules = requiredSafetyRules.filter(
    (rule) => !blueprint.safetyRules.includes(rule)
  );

  const checks = [
    {
      name: "GitHub OAuth callback route blueprint is ready",
      passed: blueprint.status === "github_oauth_callback_route_ready",
      detail: blueprint.status,
    },
    {
      name: "OAuth callback route is defined",
      passed: blueprint.route === "/api/connectors/github/callback" && blueprint.method === "GET",
      detail: `${blueprint.method} ${blueprint.route}`,
    },
    {
      name: "Callback flow present",
      passed: blueprint.callbackFlow.length >= 11,
      detail: `${blueprint.callbackFlow.length} flow steps`,
    },
    {
      name: "Safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "Core safety rules present.",
    },
    {
      name: "Token exchange shape present",
      passed:
        blueprint.tokenExchangeRequestShape.url === "https://github.com/login/oauth/access_token" &&
        blueprint.tokenExchangeRequestShape.rawTokenExposure === "never returned to client",
      detail: "Token exchange shape defined.",
    },
    {
      name: "Connector install write plan present",
      passed:
        blueprint.connectorInstallWritePlan.table === "connector_installs" &&
        blueprint.connectorInstallWritePlan.credentialField === "credentialRef" &&
        blueprint.connectorInstallWritePlan.rawSecretStored === false,
      detail: "Connector install write plan defined.",
    },
    {
      name: "Permission grant plan present",
      passed: blueprint.permissionGrantPlan.length >= 2,
      detail: `${blueprint.permissionGrantPlan.length} grants`,
    },
    {
      name: "Valid preview never exposes token",
      passed:
        validPreview.tokenExchangePlan.returnsRawTokenToClient === false &&
        validPreview.credentialRefPlan.rawTokenExposed === false &&
        validPreview.connectorInstallPlan.rawSecretStored === false,
      detail: "No raw token exposure.",
    },
    {
      name: "Missing code/state rejected",
      passed:
        rejectedMissingCodeState.ok === false &&
        rejectedMissingCodeState.errors.includes("Missing GitHub OAuth code.") &&
        rejectedMissingCodeState.errors.includes("Missing GitHub OAuth state."),
      detail: rejectedMissingCodeState.errors.join(", "),
    },
    {
      name: "Integration source statuses present",
      passed:
        blueprint.integrationSources.oauthStartStatus === "github_oauth_start_route_ready" &&
        blueprint.integrationSources.connectorDatabaseMigrationStatus === "connector_database_migration_blueprint_ready",
      detail: "Integration sources linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v20.2 Phase 222",
    service: "GitHub OAuth Callback Route Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    envConfigured: validPreview.missingEnv.length === 0,
    missingRuntimeEnv: validPreview.missingEnv,
    callbackFlowStepCount: blueprint.callbackFlow.length,
    safetyRuleCount: blueprint.safetyRules.length,
    permissionGrantCount: blueprint.permissionGrantPlan.length,
    missingCodeStateRejected: !rejectedMissingCodeState.ok,
    rawTokenExposed: validPreview.credentialRefPlan.rawTokenExposed,
    checks,
  });
}
