import { NextResponse } from "next/server";
import { getConnectorMarketplaceFoundation } from "@/lib/sovereign/connector-marketplace-foundation";

export async function GET() {
  const marketplace = getConnectorMarketplaceFoundation();

  return NextResponse.json({
    ok: true,
    phase: "v17.4 Phase 194",
    service: "Connector / Integration Marketplace Foundation",
    marketplace,
  });
}
