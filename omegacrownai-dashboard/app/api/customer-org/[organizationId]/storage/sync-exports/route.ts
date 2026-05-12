import { NextResponse } from "next/server";
import { syncCustomerExportsToStorage } from "@/lib/sugent/customer-storage/customerStorageEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await syncCustomerExportsToStorage({
    organizationId,
    companyId: body.companyId ? String(body.companyId) : null,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    exportsDir: body.exportsDir ? String(body.exportsDir) : "public/exports",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
