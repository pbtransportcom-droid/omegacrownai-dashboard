import { NextResponse } from "next/server";
import { ensureGovernanceTenant } from "@/lib/sugent/governance/governanceEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const tenant = await ensureGovernanceTenant({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    name: body.name ? String(body.name) : null,
  });

  return NextResponse.json({
    ok: true,
    tenant,
  });
}
