import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeDepartmentMemory } from "@/lib/sugent/company/departments";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  const { departmentId } = await params;

  const memory = await prisma.departmentMemory.findMany({
    where: { departmentId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    departmentId,
    memory,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  const { departmentId } = await params;
  const body = await req.json();

  const memory = await writeDepartmentMemory({
    departmentId,
    kind: String(body.kind || "fact"),
    content: String(body.content || ""),
    tags: body.tags || {},
  });

  return NextResponse.json({
    ok: true,
    memory,
  });
}
