import { NextResponse } from "next/server";
import { applyRuntimeControl, getRuntimeControlState } from "@/lib/sugent/runtime/control";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || "";

  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "sessionId is required." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    sessionId,
    state: getRuntimeControlState(sessionId),
  });
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || "";
  const body = await req.json();

  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "sessionId is required." },
      { status: 400 }
    );
  }

  if (!body.type) {
    return NextResponse.json(
      { ok: false, error: "control type is required." },
      { status: 400 }
    );
  }

  const state = applyRuntimeControl(sessionId, body);

  return NextResponse.json({
    ok: true,
    sessionId,
    type: body.type,
    state,
  });
}
