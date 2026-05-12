import { NextResponse } from "next/server";
import { getPassportDashboard } from "@/lib/sugent/passport/passportEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getPassportDashboard(companyId);

  return NextResponse.json(result);
}
