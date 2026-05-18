import { NextResponse } from "next/server";
import { getCustomerDownloadPackageRoute } from "@/lib/sovereign/customer-download-package-route";

export async function GET() {
  const download = getCustomerDownloadPackageRoute();

  return NextResponse.json({
    ok: true,
    phase: "v24.0 Phase 260",
    service: "Customer Download Package Route",
    download,
  });
}
