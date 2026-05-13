import { NextResponse } from "next/server";
import {
  auditEventRetentionPolicy,
  requiredAuditEvents,
  sampleAuditEvents
} from "@/lib/security/enterprise-audit-policy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const organizationId = searchParams.get("organizationId");

  const scopedEvents = sampleAuditEvents.filter((event) => {
    if (tenantId && event.tenantId !== tenantId) return false;
    if (organizationId && event.organizationId !== organizationId) return false;
    return true;
  });

  return NextResponse.json(
    {
      phase: "v6.1 Phase 82",
      service: "OmegaCrownAI enterprise audit events",
      status: "ready",
      scope: {
        tenantId: tenantId ?? "all_demo",
        organizationId: organizationId ?? "all_demo"
      },
      requiredAuditEvents,
      retentionPolicy: auditEventRetentionPolicy,
      events: scopedEvents
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
