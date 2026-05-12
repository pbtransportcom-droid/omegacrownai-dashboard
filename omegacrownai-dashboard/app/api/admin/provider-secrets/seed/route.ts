import { NextResponse } from "next/server";
import { seedProviderEnvironments } from "@/lib/sugent/provider-secrets/providerSecretsEngine";

export async function POST() {
  const result = await seedProviderEnvironments();
  return NextResponse.json(result);
}
