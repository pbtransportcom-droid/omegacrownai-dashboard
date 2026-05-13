import { NextResponse } from "next/server";
import { validateOAuthConnection } from "@/lib/sugent/oauth-publishing/oauthPublishingEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const { connectionId } = await params;
  const result = await validateOAuthConnection(connectionId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
