import { runTradingCopilot } from "@/lib/trading/copilot/copilot-engine";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(
          encoder.encode(
            `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          )
        );
      };

      try {
        send("status", { step: "Detecting intent..." });

        await new Promise((r) => setTimeout(r, 300));

        send("status", { step: "Loading memory..." });

        await new Promise((r) => setTimeout(r, 300));

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

        await new Promise((r) => setTimeout(r, 300));

        send("result", result);

        controller.close();
      } catch (error) {
        send("error", {
          message: String(error),
        });

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
