import { NextResponse } from "next/server";
import { addWorkspaceMember } from "@/lib/sugent/workspaces/workspaceEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string; workspaceId: string }> }
) {
  const { companyId, workspaceId } = await params;
  const contentType = req.headers.get("content-type") || "";

  let body: any = {};
  if (contentType.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData().catch(() => null);
    body = form ? Object.fromEntries(form.entries()) : {};
  }

  if (!body.userId) {
    return NextResponse.json(
      { ok: false, error: "userId is required" },
      { status: 400 }
    );
  }

  const member = await addWorkspaceMember({
    companyId,
    workspaceId,
    userId: String(body.userId),
    role: String(body.role || "viewer"),
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(req.headers.get("referer") || new URL("/", req.url));
  }

  return NextResponse.json({
    ok: true,
    member,
  });
}
