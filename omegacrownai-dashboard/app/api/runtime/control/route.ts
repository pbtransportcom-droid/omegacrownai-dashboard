import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { applyRuntimeControl, getRuntimeControlState } from "@/lib/sugent/runtime/control";
import { authConfig } from "@/lib/auth";
import { ensureProjectOwnerRole, requirePermission } from "@/lib/sugent/permissions/check";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || "";

  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "sessionId is required." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    sessionId,
    state: getRuntimeControlState(sessionId),
  });
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || "";
  const body = await req.json();
  const session = await getServerSession(authConfig);
  const actor = session?.user?.email || "system";
  const projectId = body.projectId ? String(body.projectId) : null;

  if (projectId) {
    await ensureProjectOwnerRole({
      userId: actor,
      projectId,
    });

    await requirePermission({
      userId: actor,
      projectId,
      domain: "agents",
      action: "control",
    });
  }

  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "sessionId is required." },
      { status: 400 }
    );
  }

  if (!body.type) {
    return NextResponse.json(
      { ok: false, error: "control type is required." },
      { status: 400 }
    );
  }

  const state = applyRuntimeControl(sessionId, body);

  return NextResponse.json({
    ok: true,
    sessionId,
    type: body.type,
    state,
  });
}
