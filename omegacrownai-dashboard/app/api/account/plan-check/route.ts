import { NextResponse } from "next/server";
import {
  canUseFeature,
  getPlanLimits,
} from "@/lib/billing/feature-gates";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const plan = body.plan || "free";

  return NextResponse.json({
    ok: true,
    plan,
    limits: getPlanLimits(plan),
    allowed: canUseFeature(
      plan,
      body.feature || "copilotPerDay",
      Number(body.currentUsage || 0)
    ),
  });
}
