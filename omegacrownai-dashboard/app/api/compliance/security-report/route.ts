import { NextResponse } from "next/server";
import {
  enterpriseSecurityReport,
  evaluateComplianceReadiness
} from "@/lib/compliance/enterprise-compliance-evidence";

export async function GET() {
  return NextResponse.json(
    {
      ...enterpriseSecurityReport,
      generatedAt: new Date().toISOString(),
      readiness: evaluateComplianceReadiness()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
