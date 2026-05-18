import { NextResponse } from "next/server";
import {
  createGitHubOAuthStartPreview,
  getGitHubOAuthStartRouteBlueprint,
} from "@/lib/sovereign/github-oauth-start-route";

const requiredEnv = [
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_OAUTH_REDIRECT_URI",
];

const requiredSafetyRules = [
  "Do not expose GITHUB_CLIENT_SECRET in URL, logs, client response, or UI.",
  "Do not request token in start route.",
  "Do not store raw token in connector install records.",
  "State must be bound to workspace and user.",
  "State must expire.",
  "Callback route must verify state before token exchange.",
  "Credential persistence must store credential_ref only.",
];

export async function GET() {
  const blueprint = getGitHubOAuthStartRouteBlueprint();
  const preview = createGitHubOAuthStartPreview({
    workspaceId: "workspace_demo",
    userId: "admin",
    returnTo: "/connectors/github",
  });

  const missingEnvRules = requiredEnv.filter(
    (item) => !blueprint.requiredEnvironmentVariables.includes(item)
  );

  const missingSafetyRules = requiredSafetyRules.filter(
    (item) => !blueprint.safetyRules.includes(item)
  );

  const checks = [
    {
      name: "GitHub OAuth start route blueprint is ready",
      passed: blueprint.status === "github_oauth_start_route_ready",
      detail: blueprint.status,
    },
    {
      name: "OAuth start route is defined",
      passed: blueprint.route === "/api/connectors/github/start" && blueprint.method === "GET",
      detail: `${blueprint.method} ${blueprint.route}`,
    },
    {
      name: "Required environment variables documented",
      passed: missingEnvRules.length === 0,
      detail: missingEnvRules.length ? `Missing: ${missingEnvRules.join(", ")}` : "All env vars present.",
    },
    {
      name: "Start flow present",
      passed: blueprint.startFlow.length >= 8,
      detail: `${blueprint.startFlow.length} flow steps`,
    },
    {
      name: "Requested scopes present",
      passed: blueprint.requestedScopes.length >= 2,
      detail: `${blueprint.requestedScopes.length} scopes`,
    },
    {
      name: "Safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "Core safety rules present.",
    },
    {
      name: "State record shape present",
      passed:
        Boolean(blueprint.pendingStateRecordShape.state) &&
        Boolean(blueprint.pendingStateRecordShape.workspaceId) &&
        Boolean(blueprint.pendingStateRecordShape.userId) &&
        blueprint.pendingStateRecordShape.redacted === true,
      detail: "State record shape defined.",
    },
    {
      name: "Preview creates state and authorization URL",
      passed:
        Boolean(preview.stateRecord.state) &&
        preview.authorizationUrl.includes("https://github.com/login/oauth/authorize") &&
        preview.safety.clientSecretExposed === false,
      detail: "Start preview generated.",
    },
    {
      name: "Integration source statuses present",
      passed:
        blueprint.integrationSources.githubOAuthBlueprintStatus === "github_oauth_blueprint_ready" &&
        blueprint.integrationSources.connectorDatabaseMigrationStatus === "connector_database_migration_blueprint_ready",
      detail: "Integration sources linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v20.1 Phase 221",
    service: "GitHub OAuth Start Route Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    envConfigured: preview.ok,
    missingRuntimeEnv: preview.missingEnv,
    startFlowStepCount: blueprint.startFlow.length,
    requestedScopeCount: blueprint.requestedScopes.length,
    safetyRuleCount: blueprint.safetyRules.length,
    checks,
  });
}
