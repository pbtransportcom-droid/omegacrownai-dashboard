import { NextResponse } from "next/server";
import { rotateProviderSecret } from "@/lib/sugent/provider-secrets/providerSecretsEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ secretId: string }> }
) {
  const { secretId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.value) {
    return NextResponse.json({ ok: false, error: "value is required" }, { status: 400 });
  }

  const result = await rotateProviderSecret({
    secretId,
    value: String(body.value),
    rotatedByAdminId: body.rotatedByAdminId ? String(body.rotatedByAdminId) : "system-admin",
    reason: body.reason ? String(body.reason) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
