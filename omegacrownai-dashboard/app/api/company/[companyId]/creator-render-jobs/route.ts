import { NextResponse } from "next/server";
import { getCreatorRenderJobDashboard } from "@/lib/sugent/creator-render/renderJobEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getCreatorRenderJobDashboard(companyId);

  return NextResponse.json(result);
}
