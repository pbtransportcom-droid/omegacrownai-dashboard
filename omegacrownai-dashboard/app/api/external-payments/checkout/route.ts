import { NextResponse } from "next/server";
import { createExternalPaymentAttempt } from "@/lib/sugent/external-payments/externalPaymentEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.organizationId || !body.provider) {
    return NextResponse.json(
      { ok: false, error: "organizationId and provider are required" },
      { status: 400 }
    );
  }

  const result = await createExternalPaymentAttempt({
    organizationId: String(body.organizationId),
    userId: body.userId ? String(body.userId) : null,
    companyId: body.companyId ? String(body.companyId) : null,
    provider: String(body.provider),
    planTier: body.planTier ? String(body.planTier) : "pro",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
