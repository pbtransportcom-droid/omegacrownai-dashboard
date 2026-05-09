import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assignWorker, preferredRoleForTask } from "@/lib/sugent/workforce/assignWorker";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const tasks = await prisma.companyTask.findMany({
    where: { companyId },
    include: { worker: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    tasks,
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

  const type = String(body.type || "custom");
  const autoAssign = body.autoAssign !== false;

  const task = await prisma.companyTask.create({
    data: {
      companyId,
      type,
      input: body.input || {
        message: String(body.message || ""),
      },
      status: "pending",
    },
  });

  let worker = null;

  if (autoAssign) {
    worker = await assignWorker({
      companyId,
      taskId: task.id,
      role: body.role || preferredRoleForTask(type),
    });
  }

  const updated = await prisma.companyTask.findUnique({
    where: { id: task.id },
    include: { worker: true },
  });

  return NextResponse.json({
    ok: true,
    task: updated,
    worker,
  });
}
