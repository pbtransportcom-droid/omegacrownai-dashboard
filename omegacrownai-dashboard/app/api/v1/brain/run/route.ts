import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent/runAgent";
import { normalizeV1Input, normalizeV1Response } from "@/lib/sugent/compat/v1";

export async function POST(req: Request) {
  try {
    const body = normalizeV1Input(await req.json());

    const result = await runAgent({
      userId: body.userId || body.userEmail || "v1-api",
      sessionId: body.sessionId || `v1_${Date.now()}`,
      message: String(body.message || ""),
      context: {
        ...(body.context || {}),
        channel: body.context?.channel || "api",
      },
    });

    return NextResponse.json(normalizeV1Response(result));
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "v1 brain run failed.",
      },
      { status: 500 }
    );
  }
}
