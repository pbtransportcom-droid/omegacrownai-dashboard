import { runTradingCopilot } from "@/lib/trading/copilot/copilot-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        send("status", { step: "Detecting intent..." });
        await sleep(250);

        send("status", { step: "Loading memory..." });
        await sleep(250);

        send("status", { step: "Running trading agents..." });

        const result = await runTradingCopilot({
          userId: String(body.userId || "default"),
          message: String(body.message || "Find best opportunity"),
          accountSize: Number(body.accountSize || 10000),
          maxRiskPercent: Number(body.maxRiskPercent || 1),
          positions: body.positions,
          symbols: body.symbols,
        });

        send("status", { step: "Building trade plan..." });
        await sleep(250);

        send("result", result);
      } catch (error) {
        send("error", { message: String(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
