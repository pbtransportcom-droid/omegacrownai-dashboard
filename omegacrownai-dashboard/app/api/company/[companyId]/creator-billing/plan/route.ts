import { NextResponse } from "next/server";
import { upsertCreatorBillingPlan } from "@/lib/sugent/billing/creatorBillingEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const plan = await upsertCreatorBillingPlan({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    tier: body.tier ? String(body.tier) : "starter",
    createdBy: body.createdBy ? String(body.createdBy) : "system-owner",
  });

  return NextResponse.json({
    ok: true,
    plan,
  });
}
