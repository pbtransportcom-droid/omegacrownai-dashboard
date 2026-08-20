import {
  NextResponse,
} from "next/server";

import {
  buildOmegaDiscoveryReport,
} from "@/lib/omega-product-registry";

export async function GET() {
  const report =
    buildOmegaDiscoveryReport();

  return NextResponse.json({
    ok: true,
    report,
  });
}
