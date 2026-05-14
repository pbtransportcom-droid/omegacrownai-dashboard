import { NextResponse } from "next/server";
import {
  buildCustomerLaunchReadiness,
  customerLaunchReadinessControls
} from "@/lib/customer-launch-readiness/customer-launch-readiness";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v8.2 Phase 102",
      service: "Customer launch readiness",
      controls: customerLaunchReadinessControls,
      readiness: buildCustomerLaunchReadiness()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
