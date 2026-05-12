import { NextResponse } from "next/server";
import { validateProviderEnvironment } from "@/lib/sugent/provider-secrets/providerSecretsEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.provider || !body.category) {
    return NextResponse.json({ ok: false, error: "provider and category are required" }, { status: 400 });
  }

  const result = await validateProviderEnvironment({
    provider: String(body.provider),
    category: String(body.category),
    mode: body.mode ? String(body.mode) : "test",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
