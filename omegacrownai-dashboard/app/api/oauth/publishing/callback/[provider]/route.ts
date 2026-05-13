import { NextResponse } from "next/server";
import { completeOAuthCallback } from "@/lib/sugent/oauth-publishing/oauthPublishingEngine";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const url = new URL(req.url);

  const result = await completeOAuthCallback({
    provider,
    state: url.searchParams.get("state") || "",
    code: url.searchParams.get("code"),
    error: url.searchParams.get("error"),
  });

  if (result.ok && result.returnUrl) {
    return NextResponse.redirect(`${result.returnUrl}?oauth=${provider}&status=connected`);
  }

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
