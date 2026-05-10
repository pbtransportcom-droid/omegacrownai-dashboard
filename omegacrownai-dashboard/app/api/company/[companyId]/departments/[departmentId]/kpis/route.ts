import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setDepartmentKPI } from "@/lib/sugent/company/departments";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  const { departmentId } = await params;

  const kpis = await prisma.departmentKPI.findMany({
    where: { departmentId },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    departmentId,
    kpis,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  const { departmentId } = await params;
  const body = await req.json();

  const kpi = await setDepartmentKPI({
    departmentId,
    metric: String(body.metric || "metric"),
    value: Number(body.value || 0),
    period: String(body.period || "week"),
    note: body.note ? String(body.note) : null,
  });

  return NextResponse.json({
    ok: true,
    kpi,
  });
}
