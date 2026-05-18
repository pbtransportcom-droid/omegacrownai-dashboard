import { NextRequest, NextResponse } from "next/server";
import { createGitHubOAuthCallbackPreview } from "@/lib/sovereign/github-oauth-callback-route";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const callback = createGitHubOAuthCallbackPreview({
    code: params.get("code"),
    state: params.get("state"),
    workspaceId: params.get("workspaceId") || "workspace_demo",
    userId: params.get("userId") || "admin",
    dryRun: params.get("dryRun") === "1",
  });

  const dryRun = params.get("dryRun") === "1";

  if (dryRun) {
    return NextResponse.json({
      ok: callback.ok,
      phase: "v20.2 Phase 222",
      service: "GitHub OAuth Callback Route Dry Run",
      callback,
    }, { status: callback.ok ? 200 : 400 });
  }

  if (!callback.ok) {
    return NextResponse.redirect(
      new URL(callback.safeRedirect.failure, request.nextUrl.origin)
    );
  }

  return NextResponse.redirect(
    new URL(callback.safeRedirect.success, request.nextUrl.origin)
  );
}
