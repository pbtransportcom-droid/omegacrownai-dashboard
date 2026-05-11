import { NextResponse } from "next/server";
import {
  listDirectorsRoomSessions,
  startDirectorsRoomSession,
} from "@/lib/sugent/directors-room/directorsRoomEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const data = await listDirectorsRoomSessions(companyId);

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

  const session = await startDirectorsRoomSession({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    campaignId: body.campaignId ? String(body.campaignId) : null,
    projectId: body.projectId ? String(body.projectId) : null,
    topic: String(body.topic || "OmegaCrownAI creative direction"),
    initialDraft: String(
      body.initialDraft ||
        "Create a premium OmegaCrownAI creative concept with strong prompt accuracy, factual consistency, cinematic polish, brand alignment, and a clear call to action."
    ),
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(req.headers.get("referer") || new URL("/", req.url));
  }

  return NextResponse.json({
    ok: true,
    session,
  });
}
