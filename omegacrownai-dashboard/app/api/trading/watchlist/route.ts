import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

async function getEmail(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    return typeof token?.email === "string" ? token.email : "";
  } catch {
    return "";
  }
}

function normalizeSymbols(input: any) {
  const raw = Array.isArray(input)
    ? input
    : String(input || "")
        .split(",");

  return Array.from(
    new Set(
      raw
        .map((symbol: any) => String(symbol || "").trim().toUpperCase())
        .filter(Boolean)
    )
  ).slice(0, 25);
}

export async function GET(req: NextRequest) {
  const ownerEmail = await getEmail(req);

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.tradingWatchlistItem.findMany({
    where: { ownerEmail },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    ok: true,
    symbols: rows.map((row: any) => row.symbol),
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

  await prisma.tradingWatchlistItem.deleteMany({
    where: { ownerEmail },
  });

  await prisma.tradingWatchlistItem.createMany({
    data: symbols.map((symbol) => ({
      ownerEmail,
      symbol,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({
    ok: true,
    symbols,
  });
}

export async function DELETE(req: NextRequest) {
  const ownerEmail = await getEmail(req);

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await prisma.tradingWatchlistItem.deleteMany({
    where: { ownerEmail },
  });

  return NextResponse.json({ ok: true });
}
