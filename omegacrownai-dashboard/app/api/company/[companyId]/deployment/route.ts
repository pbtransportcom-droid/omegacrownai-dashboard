import { NextResponse } from "next/server";
import { getDeploymentDashboard } from "@/lib/sugent/deployment/deploymentEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getDeploymentDashboard(companyId);

  return NextResponse.json(result);
}
