import { NextResponse } from "next/server";
import {
  trackUsage,
  getUsage,
} from "@/lib/billing/usage-tracker";

export async function GET(req: Request) {
  const url = new URL(req.url);

  return NextResponse.json(
    getUsage(
      url.searchParams.get("userId") ||
        "default"
    )
  );
}

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json(
    trackUsage(
      body.userId || "default",
      body.category || "copilot"
    )
  );
}
