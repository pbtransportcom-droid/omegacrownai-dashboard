import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { runAgent } from "@/lib/agent/runAgent";
import { checkAiUsageLimit } from "@/lib/security/aiUsageLimit";
import { RuntimeHub } from "@/lib/sugent/runtime/hub";
import { streamAgentText } from "@/lib/sugent/runtime/streams";
import { MemoryWriter } from "@/lib/sugent/memory/write";

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
    const runtimeSessionId = String(
      body.runtimeSessionId || body.context?.runtimeSessionId || body.sessionId || ""
    );

    if (runtimeSessionId) {
      RuntimeHub.emit(runtimeSessionId, {
        type: "agent_message",
        from: "user",
        to: "omega_crown_super_agent",
        role: "request",
        content: message || "Empty request",
      });

      RuntimeHub.emit(runtimeSessionId, {
        type: "tool_call",
        tool: "runAgent",
        args: {
          sessionId: body.sessionId,
          channel: body.context?.channel || "web_app",
        },
      });
    }

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
        runtimeSessionId: runtimeSessionId || undefined,
      },
    });

    const memoryProjectId =
      Array.isArray((result as any).actions)
        ? ((result as any).actions as any[]).find(
            (action: any) => action && typeof action === "object" && action.projectId
          )?.projectId
        : null;

    await MemoryWriter.write({
      projectId: memoryProjectId || null,
      sessionId,
      type: "user",
      content: message,
      tags: [String((result as any).intent || "agent"), "request"],
      score: 0.7,
    });

    await MemoryWriter.write({
      projectId: memoryProjectId || null,
      sessionId,
      type: "agent",
      content: String((result as any).reply || ""),
      tags: [String((result as any).intent || "agent"), "reply"],
      score: 0.8,
    });

    if (runtimeSessionId) {
      RuntimeHub.emit(runtimeSessionId, {
        type: "tool_result",
        tool: "runAgent",
        result: {
          ok: result.ok,
          intent: result.intent,
          actions: result.actions,
        },
      });

      const actionList: any[] = Array.isArray((result as any).actions)
        ? ((result as any).actions as any[])
        : [];

      const createdAction: any =
        actionList.find((action: any) =>
          action &&
          typeof action === "object" &&
          [
            "project_created",
            "trading_strategy_created",
            "automation_flow_created",
          ].includes(action.type)
        ) || null;

      if (createdAction) {
        RuntimeHub.emit(runtimeSessionId, {
          type: "builder_update",
          draft: {
            actionType: createdAction.type,
            projectId: createdAction.projectId,
            buildId: createdAction.buildId,
            artifactId: createdAction.artifactId,
            builderUrl: createdAction.builderUrl || createdAction.buildUrl,
          },
        });
      }

      await streamAgentText(runtimeSessionId, result.reply || "Agent run complete.", 5);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    try {
      const body = await req.clone().json().catch(() => ({}));
      const runtimeSessionId = String(
        body.runtimeSessionId || body.context?.runtimeSessionId || body.sessionId || ""
      );

      if (runtimeSessionId) {
        RuntimeHub.emit(runtimeSessionId, {
          type: "error",
          message: error?.message || "Agent run failed.",
        });
      }
    } catch {}

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Agent run failed.",
      },
      { status: 500 }
    );
  }
}
