import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const audiences = await prisma.marketingAudience.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    audiences,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json();

  const audience = await prisma.marketingAudience.create({
    data: {
      companyId,
      name: String(body.name || "Audience"),
      segment: body.segment ? String(body.segment) : null,
      description: body.description ? String(body.description) : null,
      painPoints: body.painPoints || [],
      goals: body.goals || [],
      channels: body.channels || [],
    },
  });

  return NextResponse.json({
    ok: true,
    audience,
  });
}
