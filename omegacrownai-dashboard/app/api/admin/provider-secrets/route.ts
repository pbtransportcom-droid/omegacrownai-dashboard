import { NextResponse } from "next/server";
import { getProviderSecretsDashboard } from "@/lib/sugent/provider-secrets/providerSecretsEngine";

export async function GET() {
  const result = await getProviderSecretsDashboard();
  return NextResponse.json(result);
}
