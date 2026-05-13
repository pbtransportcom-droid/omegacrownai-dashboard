import { NextResponse } from "next/server";
import { disconnectOAuthConnection } from "@/lib/sugent/oauth-publishing/oauthPublishingEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const { connectionId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await disconnectOAuthConnection({
    connectionId,
    disconnectedBy: body.disconnectedBy ? String(body.disconnectedBy) : "system-admin",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
