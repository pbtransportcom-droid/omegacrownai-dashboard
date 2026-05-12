import { NextResponse } from "next/server";
import { getCreatorExportDashboard } from "@/lib/sugent/creator-export/creatorExportEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getCreatorExportDashboard(companyId);

  return NextResponse.json(result);
}
