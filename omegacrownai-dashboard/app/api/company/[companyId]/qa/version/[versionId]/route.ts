import { NextResponse } from "next/server";
import { createQAScorecardForVersion } from "@/lib/sugent/quality/qaScorecardEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; versionId: string }> }
) {
  const { companyId, versionId } = await params;

  const scorecard = await createQAScorecardForVersion({
    companyId,
    versionId,
  });

  return NextResponse.json({
    ok: true,
    scorecard,
  });
}
