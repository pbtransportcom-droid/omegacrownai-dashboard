import { NextRequest, NextResponse } from "next/server";
import {
  evaluateConnectorPermissionGate,
  getConnectorPermissionGate,
} from "@/lib/sovereign/connector-permission-gate";

export async function GET() {
  const gate = getConnectorPermissionGate();

  return NextResponse.json({
    ok: true,
    phase: "v17.7 Phase 197",
    service: "Connector Permission Gate API",
    gate,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const decision = evaluateConnectorPermissionGate(body || {});

  return NextResponse.json({
    ok: decision.ok,
    phase: "v17.7 Phase 197",
    service: "Connector Permission Gate Decision",
    decision,
  });
}
