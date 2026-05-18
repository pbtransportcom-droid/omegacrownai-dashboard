import { NextResponse } from "next/server";
import { getGitHubOAuthCallbackRouteBlueprint } from "@/lib/sovereign/github-oauth-callback-route";

export async function GET() {
  const callbackRoute = getGitHubOAuthCallbackRouteBlueprint();

  return NextResponse.json({
    ok: true,
    phase: "v20.2 Phase 222",
    service: "GitHub OAuth Callback Route Blueprint",
    callbackRoute,
  });
}
