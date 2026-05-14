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

  const alert = await prisma.tradingSignalAlert.findUnique({
    where: { ownerEmail },
  });

  return NextResponse.json({
    ok: true,
    alert,
  });
}

export async function POST(req: NextRequest) {
  const ownerEmail = await getEmail(req);

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const signal = String(body.signal || "BUY WATCH");
  const minConfidence = Number(body.minConfidence || 75);

  const alert = await prisma.tradingSignalAlert.upsert({
    where: { ownerEmail },
    update: {
      signal,
      minConfidence,
      isEnabled: body.isEnabled !== false,
    },
    create: {
      ownerEmail,
      signal,
      minConfidence,
      isEnabled: body.isEnabled !== false,
    },
  });

  return NextResponse.json({
    ok: true,
    alert,
  });
}

export async function DELETE(req: NextRequest) {
  const ownerEmail = await getEmail(req);

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await prisma.tradingSignalAlert.deleteMany({
    where: { ownerEmail },
  });

  return NextResponse.json({ ok: true });
}
