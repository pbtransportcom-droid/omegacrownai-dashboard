import { NextResponse } from "next/server";
import { createExecutiveActionPlan } from "@/lib/sugent/executive/loop";
import { protectInternalRoute } from "@/lib/security/protectedRoute";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "executive-action-plan",
    limit: 20,
    action: "executive_action_plan",
  });
  if (!protection.ok) return protection.response;

  const { id } = await params;
  const contentType = req.headers.get("content-type") || "";

  let body: any = {};
  if (contentType.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData().catch(() => null);
    body = form ? Object.fromEntries(form.entries()) : {};
  }

  const result = await createExecutiveActionPlan({
    projectId: id,
    runtimeSessionId: body.runtimeSessionId || body.sessionId || `executive-${id}`,
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${id}/company/executive`, req.url));
  }

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
