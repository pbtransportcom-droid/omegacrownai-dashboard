import { NextResponse } from "next/server";
import { createQAScorecardForVersion } from "@/lib/sugent/quality/qaScorecardEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.companyId || !body.versionId) {
    return NextResponse.json(
      { ok: false, error: "companyId and versionId are required" },
      { status: 400 }
    );
  }

  const scorecard = await createQAScorecardForVersion({
    companyId: String(body.companyId),
    versionId: String(body.versionId),
  });

  return NextResponse.json({
    ok: true,
    scorecard,
  });
}
