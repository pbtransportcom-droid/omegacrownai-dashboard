import { NextResponse } from "next/server";
import { runPremiumProviderGeneration } from "@/lib/sugent/customer-providers/customerPremiumProviderEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await runPremiumProviderGeneration({
    organizationId,
    companyId: body.companyId ? String(body.companyId) : null,
    provider: body.provider ? String(body.provider) : "omega_native",
    category: body.category ? String(body.category) : "tts",
    prompt: body.prompt ? String(body.prompt) : null,
    outputType: body.outputType ? String(body.outputType) : null,
    model: body.model ? String(body.model) : null,
    voiceId: body.voiceId ? String(body.voiceId) : null,
    createdByUserId: body.createdByUserId ? String(body.createdByUserId) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
