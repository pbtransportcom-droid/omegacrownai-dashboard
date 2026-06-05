import { NextResponse } from "next/server";
import { getAlpacaPositions } from "@/lib/trading/broker/alpaca-broker";

export const runtime = "nodejs";

export async function GET() {
  try {
    const positions = await getAlpacaPositions();

    return NextResponse.json({
      ok: true,
      broker: "alpaca",
      mode: "paper",
      positions,
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
