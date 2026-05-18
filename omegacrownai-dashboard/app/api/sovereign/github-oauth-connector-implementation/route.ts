import { NextResponse } from "next/server";
import { getGitHubOAuthConnectorImplementation } from "@/lib/sovereign/github-oauth-connector-implementation";

export async function GET() {
  const githubOAuth = getGitHubOAuthConnectorImplementation();

  return NextResponse.json({
    ok: true,
    phase: "v18.3 Phase 203",
    service: "GitHub OAuth Connector Implementation",
    githubOAuth,
  });
}
