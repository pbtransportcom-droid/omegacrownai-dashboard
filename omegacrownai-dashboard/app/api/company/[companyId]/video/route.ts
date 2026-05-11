import { NextResponse } from "next/server";
import { getVideoDashboard } from "@/lib/sugent/video/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const dashboard = await getVideoDashboard(companyId);

  return NextResponse.json(dashboard);
}
