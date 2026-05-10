import { NextResponse } from "next/server";
import { executeDepartmentTask } from "@/lib/sugent/company/departmentExecution";
import { protectInternalRoute } from "@/lib/security/protectedRoute";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "department-task-run",
    limit: 30,
    action: "department_task_run",
  });
  if (!protection.ok) return protection.response;

  const { taskId } = await params;
  const result = await executeDepartmentTask({ taskId });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
