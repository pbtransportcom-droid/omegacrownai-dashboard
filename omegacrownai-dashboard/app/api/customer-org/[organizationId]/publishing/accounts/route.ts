import { NextResponse } from "next/server";
import { connectCustomerExternalAccount } from "@/lib/sugent/customer-publishing/customerPublishingEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await connectCustomerExternalAccount({
    organizationId,
    companyId: body.companyId ? String(body.companyId) : null,
    provider: body.provider ? String(body.provider) : "webhook",
    mode: body.mode ? String(body.mode) : "test",
    status: body.status ? String(body.status) : "connected",
    displayName: body.displayName ? String(body.displayName) : null,
    externalAccountId: body.externalAccountId ? String(body.externalAccountId) : null,
    accessToken: body.accessToken ? String(body.accessToken) : null,
    refreshToken: body.refreshToken ? String(body.refreshToken) : null,
    scopes: body.scopes || [],
    metadata: body.metadata || {},
    connectedByUserId: body.connectedByUserId ? String(body.connectedByUserId) : null,
  });

  return NextResponse.json(result);
}
