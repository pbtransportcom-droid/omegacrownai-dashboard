import {
  NextResponse,
} from "next/server";

import {
  omegaProducts,
} from "@/lib/omega-product-registry";

import {
  validateOmegaProductRegistry,
} from "@/lib/omega-product-registry/validate";

export async function GET() {
  const validation =
    validateOmegaProductRegistry();

  return NextResponse.json({
    ok: validation.ok,
    generatedAt:
      new Date().toISOString(),
    validation,
    products: omegaProducts,
  });
}
