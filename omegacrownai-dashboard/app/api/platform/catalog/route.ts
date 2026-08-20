import {
  NextResponse,
} from "next/server";

import {
  getOmegaPlatformCatalog,
} from "@/lib/omega-product-registry";

export async function GET() {
  return NextResponse.json({
    ok: true,
    generatedAt:
      new Date().toISOString(),
    catalog:
      getOmegaPlatformCatalog(),
  });
}
