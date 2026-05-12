import { NextResponse } from "next/server";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.action || !body.entityType) {
    return NextResponse.json(
      { ok: false, error: "action and entityType are required" },
      { status: 400 }
    );
  }

  const event = await recordAuditEvent({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    projectId: body.projectId ? String(body.projectId) : null,
    actorId: body.actorId ? String(body.actorId) : "manual",
    actorType: body.actorType ? String(body.actorType) : "human",
    action: String(body.action),
    entityType: String(body.entityType),
    entityId: body.entityId ? String(body.entityId) : null,
    severity: body.severity === "critical" ? "critical" : body.severity === "warning" ? "warning" : "info",
    metadata: body.metadata || {},
    beforeJson: body.beforeJson || {},
    afterJson: body.afterJson || {},
  });

  return NextResponse.json({
    ok: true,
    event,
  });
}
