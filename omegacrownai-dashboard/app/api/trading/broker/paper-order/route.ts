import { NextResponse } from "next/server";
import { submitAlpacaPaperOrder } from "@/lib/trading/broker/alpaca-broker";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  try {
    const order = await submitAlpacaPaperOrder({
      symbol: String(body.symbol || "NVDA"),
      qty: Number(body.qty || 1),
      side: body.side === "sell" ? "sell" : "buy",
      type: body.type === "limit" ? "limit" : "market",
      timeInForce: body.timeInForce === "gtc" ? "gtc" : "day",
    });

    return NextResponse.json({
      ok: true,
      broker: "alpaca",
      mode: "paper",
      order,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        broker: "alpaca",
        mode: "paper",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
