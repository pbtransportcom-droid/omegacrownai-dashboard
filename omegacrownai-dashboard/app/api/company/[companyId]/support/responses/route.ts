import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const responses = await prisma.supportResponse.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: { ticket: true },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    responses,
  });
}
