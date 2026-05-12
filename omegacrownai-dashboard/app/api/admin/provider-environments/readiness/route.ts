import { NextResponse } from "next/server";
import { getProductionEnvironmentReadiness } from "@/lib/sugent/provider-secrets/providerSecretsEngine";

export async function GET() {
  const result = await getProductionEnvironmentReadiness();
  return NextResponse.json(result);
}
