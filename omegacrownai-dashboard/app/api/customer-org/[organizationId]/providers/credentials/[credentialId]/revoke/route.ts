import { NextResponse } from "next/server";
import { revokePremiumProviderCredential } from "@/lib/sugent/customer-providers/customerPremiumProviderEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string; credentialId: string }> }
) {
  const { credentialId } = await params;
  const result = await revokePremiumProviderCredential(credentialId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
