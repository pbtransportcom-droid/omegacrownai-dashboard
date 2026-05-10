import { NextResponse } from "next/server";
import { runExecutiveLoop } from "@/lib/sugent/executive/loop";
import { protectInternalRoute } from "@/lib/security/protectedRoute";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "executive-run",
    limit: 20,
    action: "executive_run",
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

  const result = await runExecutiveLoop({
    projectId: id,
    sessionId: body.sessionId || `executive-${id}`,
    runtimeSessionId: body.runtimeSessionId || body.sessionId || `executive-${id}`,
    limit: Number(body.limit || 10),
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${id}/company/executive`, req.url));
  }

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
