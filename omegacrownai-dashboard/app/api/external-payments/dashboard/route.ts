import { NextResponse } from "next/server";
import { getExternalPaymentsDashboard } from "@/lib/sugent/external-payments/externalPaymentEngine";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const result = await getExternalPaymentsDashboard(url.searchParams.get("organizationId"));
  return NextResponse.json(result);
}
