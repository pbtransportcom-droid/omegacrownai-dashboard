import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runOperationsProcess } from "@/lib/sugent/operations/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const runs = await prisma.operationsRun.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      process: true,
    },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    runs,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const operationsDept = await prisma.companyDepartment.findFirst({
    where: { companyId, slug: "operations" },
  });

  const result = await runOperationsProcess({
    companyId,
    departmentId: operationsDept?.id || null,
    processId: body.processId ? String(body.processId) : null,
    notes: body.notes ? String(body.notes) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
