import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOperationsProcess } from "@/lib/sugent/operations/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const processes = await prisma.operationsProcess.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      checklists: true,
      runs: true,
    },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    processes,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const contentType = req.headers.get("content-type") || "";

  let body: any = {};
  if (contentType.includes("application/json")) {
    body = await req.json();
  } else {
    const form = await req.formData();
    body = Object.fromEntries(form.entries());
  }

  const operationsDept = await prisma.companyDepartment.findFirst({
    where: { companyId, slug: "operations" },
  });

  const result = await createOperationsProcess({
    companyId,
    departmentId: operationsDept?.id || null,
    name: String(body.name || body.objective || "Operations Process"),
    description: body.description ? String(body.description) : null,
    priority: String(body.priority || "medium"),
    objective: String(body.objective || body.name || "Create operations workflow."),
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/operations`, req.url));
  }

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
