import { NextResponse } from "next/server";
import { getCreativeStudioDashboard } from "@/lib/sugent/creative-agents/coordinator";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const data = await getCreativeStudioDashboard(companyId);

  return NextResponse.json(data);
}
