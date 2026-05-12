import { NextResponse } from "next/server";
import { disconnectCustomerExternalAccount } from "@/lib/sugent/customer-publishing/customerPublishingEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string; accountId: string }> }
) {
  const { accountId } = await params;
  const result = await disconnectCustomerExternalAccount(accountId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
