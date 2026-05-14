import { NextResponse } from "next/server";
import {
  buildCustomerFacingCopyPackage,
  customerFacingCopyControls
} from "@/lib/customer-facing-polish/customer-facing-copy";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v8.4 Phase 104",
      service: "Customer-facing copy alignment",
      controls: customerFacingCopyControls,
      copy: buildCustomerFacingCopyPackage()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
