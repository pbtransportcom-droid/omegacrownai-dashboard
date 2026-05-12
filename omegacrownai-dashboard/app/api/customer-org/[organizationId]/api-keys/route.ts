import { NextResponse } from "next/server";
import { createCustomerApiKey, getCustomerDashboardByOrganization } from "@/lib/sugent/customer-dashboard/customerDashboardEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const result = await getCustomerDashboardByOrganization(organizationId);

  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    apiKeys: (result.organization as any).apiKeys || [],
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await createCustomerApiKey({
    organizationId,
    userId: body.userId ? String(body.userId) : null,
    name: body.name ? String(body.name) : "Default API Key",
    scopes: body.scopes || undefined,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
