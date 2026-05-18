import { NextResponse } from "next/server";
import { getRealConnectorInstallStore } from "@/lib/sovereign/real-connector-install-store";

export async function GET() {
  const store = getRealConnectorInstallStore();

  return NextResponse.json({
    ok: true,
    phase: "v18.2 Phase 202",
    service: "Real Connector Install Store",
    store,
  });
}
