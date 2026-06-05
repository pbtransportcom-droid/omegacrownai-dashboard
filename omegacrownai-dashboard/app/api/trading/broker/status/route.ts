import { NextResponse } from "next/server";
import { getAlpacaAccount } from "@/lib/trading/broker/alpaca-broker";

export const runtime = "nodejs";

export async function GET() {
  try {
    const account = await getAlpacaAccount();

    return NextResponse.json({
      ok: true,
      broker: "alpaca",
      mode: "paper",
      account,
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
