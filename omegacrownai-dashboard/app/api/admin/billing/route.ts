import { NextResponse } from "next/server";
import {
  getUserPlan,
  setUserPlan,
} from "@/lib/billing/admin/plan-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const userId =
    url.searchParams.get("userId") || "default";

  return NextResponse.json({
    ok: true,
    plan: getUserPlan(userId),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json({
    ok: true,
    plan: setUserPlan(
      String(body.userId || "default"),
      body.plan || "free"
    ),
  });
}
