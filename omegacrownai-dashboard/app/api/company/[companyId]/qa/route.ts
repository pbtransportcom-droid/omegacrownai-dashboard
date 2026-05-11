import { NextResponse } from "next/server";
import { listQAScorecards } from "@/lib/sugent/quality/qaScorecardEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await listQAScorecards(companyId);

  return NextResponse.json(result);
}
