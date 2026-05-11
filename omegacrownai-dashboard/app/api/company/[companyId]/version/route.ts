import { NextResponse } from "next/server";
import { getVersioningDashboard } from "@/lib/sugent/versioning/versionEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const data = await getVersioningDashboard(companyId);

  return NextResponse.json(data);
}
