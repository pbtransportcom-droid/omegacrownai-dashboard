import { RuntimeHub } from "@/lib/sugent/runtime/hub";

export const dynamic = "force-dynamic";

function encodeSSE(data: any) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || `runtime_${Date.now()}`;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const unsubscribe = RuntimeHub.register(sessionId, (message) => {
        controller.enqueue(encoder.encode(encodeSSE(message)));
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(
          encoder.encode(
            encodeSSE({
              type: "heartbeat",
              sessionId,
              createdAt: new Date().toISOString(),
            })
          )
        );
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
