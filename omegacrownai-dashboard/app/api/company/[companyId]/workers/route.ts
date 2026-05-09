import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const workers = await prisma.worker.findMany({
    where: { companyId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    ok: true,
    companyId,
    workers,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json();

  const worker = await prisma.worker.create({
    data: {
      companyId,
      role: String(body.role || "custom"),
      name: String(body.name || "Worker"),
      status: String(body.status || "idle"),
    },
  });

  return NextResponse.json({
    ok: true,
    worker,
  });
}
