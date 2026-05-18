import { NextResponse } from "next/server";
import { getGitHubOAuthConnectorImplementation } from "@/lib/sovereign/github-oauth-connector-implementation";

const requiredEnv = [
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_OAUTH_REDIRECT_URI",
  "CONNECTOR_SECRET_KEY",
];

const requiredRoutes = [
  "/api/connectors/github/start",
  "/api/connectors/github/callback",
  "/api/connectors/github/disconnect",
];

const requiredBlocked = [
  "Direct push to main",
  "Merge pull request",
  "Delete repository",
  "Create production release",
  "Read or change repository secrets",
];

export async function GET() {
  const githubOAuth = getGitHubOAuthConnectorImplementation();

  const envNames = githubOAuth.requiredEnvironmentVariables.map((item) => item.name);
  const routeNames = githubOAuth.oauthRoutes.map((item) => item.route);

  const missingEnv = requiredEnv.filter((item) => !envNames.includes(item));
  const missingRoutes = requiredRoutes.filter((item) => !routeNames.includes(item));
  const missingBlocked = requiredBlocked.filter((item) => !githubOAuth.blockedByDefault.includes(item));

  const checks = [
    {
      name: "GitHub OAuth blueprint is ready",
      passed: githubOAuth.status === "github_oauth_blueprint_ready",
      detail: githubOAuth.status,
    },
    {
      name: "Required environment variables present",
      passed: missingEnv.length === 0,
      detail: missingEnv.length ? `Missing: ${missingEnv.join(", ")}` : "All required env vars present.",
    },
    {
      name: "OAuth routes planned",
      passed: missingRoutes.length === 0,
      detail: missingRoutes.length ? `Missing: ${missingRoutes.join(", ")}` : "All OAuth routes planned.",
    },
    {
      name: "Install lifecycle present",
      passed: githubOAuth.installLifecycle.length >= 10,
      detail: `${githubOAuth.installLifecycle.length} lifecycle steps`,
    },
    {
      name: "GitHub API actions present",
      passed: githubOAuth.githubApiActions.length >= 4,
      detail: `${githubOAuth.githubApiActions.length} actions`,
    },
    {
      name: "Credential safety rules present",
      passed: githubOAuth.credentialRules.length >= 6,
      detail: `${githubOAuth.credentialRules.length} credential rules`,
    },
    {
      name: "Permission and audit integration present",
      passed: githubOAuth.permissionAndAuditIntegration.length >= 5,
      detail: `${githubOAuth.permissionAndAuditIntegration.length} integration rules`,
    },
    {
      name: "Repository selector plan present",
      passed: githubOAuth.repositorySelectorPlan.length >= 5,
      detail: `${githubOAuth.repositorySelectorPlan.length} selector rules`,
    },
    {
      name: "Blocked-by-default GitHub actions present",
      passed: missingBlocked.length === 0,
      detail: missingBlocked.length ? `Missing: ${missingBlocked.join(", ")}` : "Core blocked actions present.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v18.3 Phase 203",
    service: "GitHub OAuth Connector Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    envVarCount: githubOAuth.requiredEnvironmentVariables.length,
    oauthRouteCount: githubOAuth.oauthRoutes.length,
    lifecycleStepCount: githubOAuth.installLifecycle.length,
    githubApiActionCount: githubOAuth.githubApiActions.length,
    credentialRuleCount: githubOAuth.credentialRules.length,
    blockedActionCount: githubOAuth.blockedByDefault.length,
    checks,
  });
}
