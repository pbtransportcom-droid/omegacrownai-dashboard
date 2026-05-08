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

  const alert = await prisma.tradingSignalAlert.findUnique({
    where: { ownerEmail },
  });

  return NextResponse.json({
    ok: true,
    alert,
  });
}

export async function POST(req: Request) {
  const ownerEmail = await getEmail();

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

export async function DELETE() {
  const ownerEmail = await getEmail();

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await prisma.tradingSignalAlert.deleteMany({
    where: { ownerEmail },
  });

  return NextResponse.json({ ok: true });
}
