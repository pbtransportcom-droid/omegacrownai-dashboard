import { NextResponse } from "next/server";
import { runNextCompanyTask } from "@/lib/sugent/workforce/loop";
import { protectInternalRoute } from "@/lib/security/protectedRoute";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "workforce-run-next",
    limit: 20,
    action: "workforce_run_next",
  });
  if (!protection.ok) return protection.response;

  const { companyId } = await params;
  const contentType = req.headers.get("content-type") || "";

  let body: any = {};
  if (contentType.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData().catch(() => null);
    body = form ? Object.fromEntries(form.entries()) : {};
  }

  const result = await runNextCompanyTask({
    companyId,
    sessionId: body.sessionId || `workforce-${companyId}`,
    runtimeSessionId: body.runtimeSessionId || body.sessionId || `workforce-${companyId}`,
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${body.projectId || ""}/company`, req.url));
  }

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
