import { NextResponse } from "next/server";
import { verifyPassport } from "@/lib/sugent/passport/passportEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.passportHash) {
    return NextResponse.json(
      { ok: false, error: "passportHash is required" },
      { status: 400 }
    );
  }

  const result = await verifyPassport({
    companyId,
    passportHash: String(body.passportHash),
    signatureHash: body.signatureHash ? String(body.signatureHash) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
