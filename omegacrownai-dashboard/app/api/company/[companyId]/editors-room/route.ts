import { NextResponse } from "next/server";
import {
  listEditorsRoomSessions,
  startEditorsRoomSession,
} from "@/lib/sugent/editors-room/editorsRoomEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const data = await listEditorsRoomSessions(companyId);

  return NextResponse.json(data);
}

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

  if (!body.projectId) {
    return NextResponse.json(
      { ok: false, error: "projectId is required" },
      { status: 400 }
    );
  }

  const session = await startEditorsRoomSession({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    projectId: String(body.projectId),
    topic: body.topic ? String(body.topic) : null,
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(req.headers.get("referer") || new URL("/", req.url));
  }

  return NextResponse.json({
    ok: true,
    session,
  });
}
