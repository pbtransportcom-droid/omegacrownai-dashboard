import { NextRequest, NextResponse } from "next/server";
import { createGitHubOAuthStartPreview } from "@/lib/sovereign/github-oauth-start-route";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const start = createGitHubOAuthStartPreview({
    workspaceId: params.get("workspaceId") || "workspace_demo",
    userId: params.get("userId") || "admin",
    returnTo: params.get("returnTo") || "/connectors/github",
  });

  if (!start.ok) {
    return NextResponse.json(
      {
        ok: false,
        phase: "v20.1 Phase 221",
        service: "GitHub OAuth Start Route",
        error: "Missing GitHub OAuth environment configuration.",
        missingEnv: start.missingEnv,
        safety: start.safety,
      },
      { status: 503 }
    );
  }

  const dryRun = params.get("dryRun") === "1";

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      phase: "v20.1 Phase 221",
      service: "GitHub OAuth Start Route Dry Run",
      start,
    });
  }

  return NextResponse.redirect(start.authorizationUrl);
}
