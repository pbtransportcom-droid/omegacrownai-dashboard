import { NextResponse } from "next/server";
import { RuntimeHub } from "@/lib/sugent/runtime/hub";
import { streamAgentText, streamBuilderUpdate, streamCloudJob, streamToolCall } from "@/lib/sugent/runtime/streams";

export async function POST(req: Request) {
  const body = await req.json();
  const sessionId = String(body.sessionId || "runtime-test");

  RuntimeHub.emit(sessionId, {
    type: "agent_message",
    from: "planner",
    to: "builder",
    role: "planner",
    content: "Starting Sugent Runtime test.",
  });

  await streamToolCall(sessionId, "runtime_ping", { ok: true }, async (args) => ({
    received: args,
    listeners: RuntimeHub.count(sessionId),
  }));

  streamBuilderUpdate(sessionId, {
    version: "runtime_preview_v1",
    title: "Live builder update",
    status: "streamed",
  });

  streamCloudJob(sessionId, "queued", {
    job: "runtime-demo",
  });

  await streamAgentText(
    sessionId,
    "Sugent Runtime is online. Agent tokens, tool calls, builder updates, and cloud job updates are streaming live.",
    5
  );

  streamCloudJob(sessionId, "success", {
    job: "runtime-demo",
    result: "complete",
  });

  return NextResponse.json({
    ok: true,
    sessionId,
    listeners: RuntimeHub.count(sessionId),
  });
}
