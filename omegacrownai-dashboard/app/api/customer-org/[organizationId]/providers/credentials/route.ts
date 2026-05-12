import { NextResponse } from "next/server";
import { connectPremiumProviderCredential } from "@/lib/sugent/customer-providers/customerPremiumProviderEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await connectPremiumProviderCredential({
    organizationId,
    companyId: body.companyId ? String(body.companyId) : null,
    provider: body.provider ? String(body.provider) : "omega_native",
    category: body.category ? String(body.category) : "tts",
    mode: body.mode ? String(body.mode) : "test",
    status: body.status ? String(body.status) : "connected",
    displayName: body.displayName ? String(body.displayName) : null,
    apiKey: body.apiKey ? String(body.apiKey) : null,
    defaultModel: body.defaultModel ? String(body.defaultModel) : null,
    defaultVoiceId: body.defaultVoiceId ? String(body.defaultVoiceId) : null,
    configJson: body.configJson || {},
    connectedByUserId: body.connectedByUserId ? String(body.connectedByUserId) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
