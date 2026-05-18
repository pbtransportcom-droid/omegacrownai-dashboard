import { NextResponse } from "next/server";
import { getRealCustomerWebsiteAppBundleExport } from "@/lib/sovereign/real-customer-website-app-bundle-export";

export async function GET() {
  const exportLayer = getRealCustomerWebsiteAppBundleExport();

  return NextResponse.json({
    ok: true,
    phase: "v24.7 Phase 267",
    service: "Real Customer Website/App Bundle Export",
    exportLayer,
  });
}
