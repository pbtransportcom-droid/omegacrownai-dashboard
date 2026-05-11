import { NextResponse } from "next/server";
import {
  createDistributionTarget,
  ensureDefaultDistributionTargets,
  listDistributionTargets,
} from "@/lib/sugent/distribution/distributionEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  await ensureDefaultDistributionTargets(companyId);
  const result = await listDistributionTargets(companyId);

  return NextResponse.json(result);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const target = await createDistributionTarget({
    companyId,
    type: String(body.type || "internal_library"),
    label: String(body.label || "Distribution Target"),
    configJson: body.configJson || {},
  });

  return NextResponse.json({
    ok: true,
    target,
  });
}
