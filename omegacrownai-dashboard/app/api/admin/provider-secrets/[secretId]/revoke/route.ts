import { NextResponse } from "next/server";
import { revokeProviderSecret } from "@/lib/sugent/provider-secrets/providerSecretsEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ secretId: string }> }
) {
  const { secretId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await revokeProviderSecret({
    secretId,
    revokedByAdminId: body.revokedByAdminId ? String(body.revokedByAdminId) : "system-admin",
    reason: body.reason ? String(body.reason) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
