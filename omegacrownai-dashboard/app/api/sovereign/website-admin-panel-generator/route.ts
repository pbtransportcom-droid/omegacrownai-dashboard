import { NextResponse } from "next/server";
import { getWebsiteAdminPanelGenerator } from "@/lib/sovereign/website-admin-panel-generator";

export async function GET() {
  const admin = getWebsiteAdminPanelGenerator();

  return NextResponse.json({
    ok: true,
    phase: "v23.3 Phase 253",
    service: "Website Admin Panel Generator",
    admin,
  });
}
