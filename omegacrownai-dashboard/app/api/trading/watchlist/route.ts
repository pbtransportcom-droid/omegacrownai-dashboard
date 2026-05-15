import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";

async function getEmail(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    return typeof token?.email === "string" ? token.email : "";
  } catch {
    return "";
  }
}

function normalizeSymbols(input: any) {
  const raw = Array.isArray(input)
    ? input
    : String(input || "").split(",");

  return Array.from(
    new Set(
      raw
        .map((symbol: any) => String(symbol || "").trim().toUpperCase())
        .filter(Boolean)
    )
  ).slice(0, 25);
}

function parseStoredSymbols(value: any) {
  if (Array.isArray(value)) {
    return normalizeSymbols(value);
  }

  return normalizeSymbols(String(value || ""));
}

export async function GET(req: NextRequest) {
  const ownerEmail = await getEmail(req);

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.tradingWatchlist.findMany({
    where: { ownerEmail },
    orderBy: { createdAt: "desc" },
  });

  const latest: any = rows[0] || null;
  const symbols = parseStoredSymbols(latest?.symbols);

  return NextResponse.json({
    ok: true,
    symbols,
    items: rows,
  });
}

export async function POST(req: NextRequest) {
  const ownerEmail = await getEmail(req);

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const symbols = normalizeSymbols(body.symbols || body.symbol || body.watchlist);

  if (!symbols.length) {
    return NextResponse.json({ ok: false, error: "No symbols provided." }, { status: 400 });
  }

  await prisma.tradingWatchlist.deleteMany({
    where: { ownerEmail },
  });

  const item = await prisma.tradingWatchlist.create({
    data: {
      ownerEmail,
      symbols: symbols.join(","),
    },
  });

  return NextResponse.json({
    ok: true,
    symbols,
    item,
  });
}

export async function DELETE(req: NextRequest) {
  const ownerEmail = await getEmail(req);

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await prisma.tradingWatchlist.deleteMany({
    where: { ownerEmail },
  });

  return NextResponse.json({ ok: true });
}
