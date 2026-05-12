import { NextResponse } from "next/server";
import { setProviderEnvironmentActivation } from "@/lib/sugent/provider-secrets/providerSecretsEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.provider || !body.category) {
    return NextResponse.json({ ok: false, error: "provider and category are required" }, { status: 400 });
  }

  const result = await setProviderEnvironmentActivation({
    provider: String(body.provider),
    category: String(body.category),
    mode: body.mode ? String(body.mode) : "test",
    liveEnabled: typeof body.liveEnabled === "boolean" ? body.liveEnabled : undefined,
    testEnabled: typeof body.testEnabled === "boolean" ? body.testEnabled : undefined,
    adminUserId: body.adminUserId ? String(body.adminUserId) : "system-admin",
    reason: body.reason ? String(body.reason) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
