import { NextResponse } from "next/server";
import { runPremiumProvider } from "@/lib/sugent/premium-provider-activation/premiumProviderActivationEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.organizationId || !body.category) {
    return NextResponse.json(
      { ok: false, error: "organizationId and category are required" },
      { status: 400 }
    );
  }

  const result = await runPremiumProvider({
    organizationId: String(body.organizationId),
    userId: body.userId ? String(body.userId) : null,
    companyId: body.companyId ? String(body.companyId) : null,
    provider: body.provider ? String(body.provider) : null,
    category: String(body.category),
    mode: body.mode ? String(body.mode) : "test",
    inputType: body.inputType ? String(body.inputType) : null,
    outputType: body.outputType ? String(body.outputType) : null,
    prompt: body.prompt ? String(body.prompt) : null,
    voiceId: body.voiceId ? String(body.voiceId) : null,
    modelName: body.modelName ? String(body.modelName) : null,
    requestJson: body.requestJson || {},
    createdBy: body.createdBy ? String(body.createdBy) : "system",
    actorType: body.actorType ? String(body.actorType) : "system",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
