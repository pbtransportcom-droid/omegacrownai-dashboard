import { NextResponse } from "next/server";
import { getRuntimePolicyDashboard } from "@/lib/sugent/runtime-policy/runtimePolicyEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getRuntimePolicyDashboard(companyId);

  return NextResponse.json(result);
}
