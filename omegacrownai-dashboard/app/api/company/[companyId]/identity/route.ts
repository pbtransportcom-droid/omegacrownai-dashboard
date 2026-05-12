import { NextResponse } from "next/server";
import { getIdentityDashboard } from "@/lib/sugent/identity/platformIdentityEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getIdentityDashboard(companyId);

  return NextResponse.json(result);
}
