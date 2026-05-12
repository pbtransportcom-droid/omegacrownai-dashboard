import { NextResponse } from "next/server";
import { getCustomerStorageDashboard } from "@/lib/sugent/customer-storage/customerStorageEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const result = await getCustomerStorageDashboard(organizationId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
