import { NextResponse } from "next/server";
import { getConnectorInstallReview } from "@/lib/sovereign/connector-install-review";

export async function GET() {
  const review = getConnectorInstallReview();

  return NextResponse.json({
    ok: true,
    phase: "v17.6 Phase 196",
    service: "Connector Install Review UI",
    review,
  });
}
