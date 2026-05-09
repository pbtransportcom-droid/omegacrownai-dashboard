import { NextResponse } from "next/server";
import { runNextCompanyTask } from "@/lib/sugent/workforce/loop";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
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
