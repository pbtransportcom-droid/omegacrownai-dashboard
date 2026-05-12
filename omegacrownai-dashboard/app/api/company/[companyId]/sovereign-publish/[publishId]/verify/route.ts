import { NextResponse } from "next/server";
import { verifySovereignPublishEvidence } from "@/lib/sugent/publish/sovereignPublishEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; publishId: string }> }
) {
  const { companyId, publishId } = await params;
  const result = await verifySovereignPublishEvidence({ companyId, publishId });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; publishId: string }> }
) {
  const { companyId, publishId } = await params;
  const result = await verifySovereignPublishEvidence({ companyId, publishId });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
