import { NextResponse } from "next/server";
import { revokeCustomerApiKey } from "@/lib/sugent/customer-dashboard/customerDashboardEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string; apiKeyId: string }> }
) {
  const { apiKeyId } = await params;
  const result = await revokeCustomerApiKey(apiKeyId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
