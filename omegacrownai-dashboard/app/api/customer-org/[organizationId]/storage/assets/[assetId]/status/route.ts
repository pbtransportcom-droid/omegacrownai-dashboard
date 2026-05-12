import { NextResponse } from "next/server";
import { updateCustomerStorageAssetStatus } from "@/lib/sugent/customer-storage/customerStorageEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string; assetId: string }> }
) {
  const { assetId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await updateCustomerStorageAssetStatus({
    assetId,
    status: body.status ? String(body.status) : null,
    visibility: body.visibility ? String(body.visibility) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
