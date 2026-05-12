import { NextResponse } from "next/server";
import { upsertProviderSecret } from "@/lib/sugent/provider-secrets/providerSecretsEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  for (const field of ["provider", "category", "secretName", "value"]) {
    if (!body[field]) {
      return NextResponse.json({ ok: false, error: `${field} is required` }, { status: 400 });
    }
  }

  const result = await upsertProviderSecret({
    provider: String(body.provider),
    category: String(body.category),
    mode: body.mode ? String(body.mode) : "test",
    secretName: String(body.secretName),
    secretType: body.secretType ? String(body.secretType) : "api_key",
    value: String(body.value),
    createdByAdminId: body.createdByAdminId ? String(body.createdByAdminId) : "system-admin",
    reason: body.reason ? String(body.reason) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
