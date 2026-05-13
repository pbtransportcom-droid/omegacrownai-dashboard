import { NextResponse } from "next/server";
import { getOAuthPublishingDashboard } from "@/lib/sugent/oauth-publishing/oauthPublishingEngine";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const result = await getOAuthPublishingDashboard(url.searchParams.get("organizationId"));

  return NextResponse.json(result);
}
