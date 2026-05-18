import { NextResponse } from "next/server";
import { getGitHubOAuthStartRouteBlueprint } from "@/lib/sovereign/github-oauth-start-route";

export async function GET() {
  const startRoute = getGitHubOAuthStartRouteBlueprint();

  return NextResponse.json({
    ok: true,
    phase: "v20.1 Phase 221",
    service: "GitHub OAuth Start Route Blueprint",
    startRoute,
  });
}
