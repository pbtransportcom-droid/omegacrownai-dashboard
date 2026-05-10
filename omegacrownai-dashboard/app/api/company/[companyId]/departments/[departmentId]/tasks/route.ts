import { NextResponse } from "next/server";
import { createDepartmentTask } from "@/lib/sugent/company/departments";
import { assignWorker, preferredRoleForTask } from "@/lib/sugent/workforce/assignWorker";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string; departmentId: string }> }
) {
  const { companyId, departmentId } = await params;
  const departmentSlug = departmentId;
  const contentType = req.headers.get("content-type") || "";
  let body: any = {};

  if (contentType.includes("application/json")) {
    body = await req.json();
  } else {
    const form = await req.formData();
    body = Object.fromEntries(form.entries());
  }

  const type = String(body.type || `department_${departmentSlug}`);

  const task = await createDepartmentTask({
    companyId,
    departmentSlug,
    type,
    message: String(body.message || body.input?.message || ""),
    input: body.input || {},
  });

  const worker = body.autoAssign === false
    ? null
    : await assignWorker({
        companyId,
        taskId: task.id,
        role: body.role || preferredRoleForTask(type),
      });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/departments`, req.url));
  }

  return NextResponse.json({
    ok: true,
    task,
    worker,
  });
}
