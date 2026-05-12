import { NextResponse } from "next/server";
import { upsertPaymentProvider } from "@/lib/sugent/customer-billing/customerPaymentProviderEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await upsertPaymentProvider({
    organizationId,
    companyId: body.companyId ? String(body.companyId) : null,
    provider: body.provider ? String(body.provider) : "manual",
    mode: body.mode ? String(body.mode) : "test",
    status: body.status ? String(body.status) : "connected",
    displayName: body.displayName ? String(body.displayName) : null,
    externalAccountId: body.externalAccountId ? String(body.externalAccountId) : null,
    credentialsJson: body.credentialsJson || null,
    actorId: body.actorId ? String(body.actorId) : "system-owner",
    actorType: body.actorType ? String(body.actorType) : "system",
  });

  return NextResponse.json(result);
}
