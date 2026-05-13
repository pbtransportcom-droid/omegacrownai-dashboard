import { NextResponse } from "next/server";
import { confirmExternalPaymentAttempt } from "@/lib/sugent/external-payments/externalPaymentEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await confirmExternalPaymentAttempt({
    attemptId,
    status: body.status ? String(body.status) : "manually_confirmed",
    confirmedBy: body.confirmedBy ? String(body.confirmedBy) : "system-admin",
    subscriptionStatus: body.subscriptionStatus ? String(body.subscriptionStatus) : "manual_paid",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
