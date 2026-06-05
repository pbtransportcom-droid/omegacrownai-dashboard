const BASE_URL =
  process.env.ALPACA_PAPER_BASE_URL || "https://paper-api.alpaca.markets";

function getHeaders() {
  const key = process.env.ALPACA_PAPER_API_KEY;
  const secret = process.env.ALPACA_PAPER_SECRET_KEY;

  if (!key || !secret || key === "your_key" || secret === "your_secret") {
    throw new Error("Missing Alpaca paper API credentials.");
  }

  return {
    "APCA-API-KEY-ID": key,
    "APCA-API-SECRET-KEY": secret,
    "Content-Type": "application/json",
  };
}

export async function getAlpacaAccount() {
  const res = await fetch(`${BASE_URL}/v2/account`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Alpaca account error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export async function getAlpacaPositions() {
  const res = await fetch(`${BASE_URL}/v2/positions`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Alpaca positions error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export async function submitAlpacaPaperOrder(input: {
  symbol: string;
  qty: number;
  side?: "buy" | "sell";
  type?: "market" | "limit";
  timeInForce?: "day" | "gtc";
}) {
  const res = await fetch(`${BASE_URL}/v2/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      symbol: input.symbol.toUpperCase(),
      qty: String(input.qty),
      side: input.side || "buy",
      type: input.type || "market",
      time_in_force: input.timeInForce || "day",
    }),
  });

  if (!res.ok) {
    throw new Error(`Alpaca order error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
