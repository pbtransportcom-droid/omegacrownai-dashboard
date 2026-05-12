import { NextResponse } from "next/server";
import { getQAImprovementDashboard } from "@/lib/sugent/quality/qaImprovementEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getQAImprovementDashboard(companyId);

  return NextResponse.json(result);
}
