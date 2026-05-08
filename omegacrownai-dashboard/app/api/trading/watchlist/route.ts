import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getEmail() {
  const session = await getServerSession(authConfig);
  return session?.user?.email || "";
}

export async function GET() {
  const ownerEmail = await getEmail();

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const watchlist = await prisma.tradingWatchlist.findUnique({
    where: { ownerEmail },
  });

  return NextResponse.json({
    ok: true,
    watchlist,
  });
}

export async function POST(req: Request) {
  const ownerEmail = await getEmail();

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const symbols = String(body.symbols || "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .join(", ");

  if (!symbols) {
    return NextResponse.json({ ok: false, error: "Symbols are required." }, { status: 400 });
  }

  const watchlist = await prisma.tradingWatchlist.upsert({
    where: { ownerEmail },
    update: {
      symbols,
      name: body.name || "Default Watchlist",
    },
    create: {
      ownerEmail,
      symbols,
      name: body.name || "Default Watchlist",
    },
  });

  return NextResponse.json({
    ok: true,
    watchlist,
  });
}

export async function DELETE() {
  const ownerEmail = await getEmail();

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await prisma.tradingWatchlist.deleteMany({
    where: { ownerEmail },
  });

  return NextResponse.json({ ok: true });
}
