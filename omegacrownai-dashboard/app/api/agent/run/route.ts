import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { runAgent } from "@/lib/agent/runAgent";
import { checkAiUsageLimit } from "@/lib/security/aiUsageLimit";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const body = await req.json();

    const usage = await checkAiUsageLimit({
      req,
      userEmail: session?.user?.email,
      limit: 3,
    });

    if (!usage.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: usage.error,
          freeLimitReached: true,
          remaining: usage.remaining,
          limit: usage.limit,
        },
        { status: 403 }
      );
    }

    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "Message is required." },
        { status: 400 }
      );
    }

    const userId = session?.user?.email || body.userId || "anonymous";
    const sessionId = body.sessionId || `sess_${Date.now()}`;

    const result = await runAgent({
      userId,
      sessionId,
      message,
      context: {
        ...(body.context || {}),
        channel: body.context?.channel || "web_app",
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Agent run failed.",
      },
      { status: 500 }
    );
  }
}
