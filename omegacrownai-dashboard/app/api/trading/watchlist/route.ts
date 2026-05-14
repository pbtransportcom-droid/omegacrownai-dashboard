import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";

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

export async function GET(req: NextRequest) {
  const ownerEmail = await getEmail(req);

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

export async function POST(req: NextRequest) {
  const ownerEmail = await getEmail(req);

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
