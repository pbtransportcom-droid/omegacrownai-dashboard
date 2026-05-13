import { NextResponse } from "next/server";
import { createOAuthConnectUrl } from "@/lib/sugent/oauth-publishing/oauthPublishingEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.organizationId || !body.provider) {
    return NextResponse.json(
      { ok: false, error: "organizationId and provider are required" },
      { status: 400 }
    );
  }

  const result = await createOAuthConnectUrl({
    organizationId: String(body.organizationId),
    userId: body.userId ? String(body.userId) : null,
    companyId: body.companyId ? String(body.companyId) : null,
    provider: String(body.provider),
    mode: body.mode ? String(body.mode) : "test",
    returnUrl: body.returnUrl ? String(body.returnUrl) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
