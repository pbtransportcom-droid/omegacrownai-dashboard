import { NextRequest, NextResponse } from "next/server";
import {
  getWebsiteFullFunctionValidationRunner,
  runWebsiteFullFunctionValidation,
} from "@/lib/sovereign/website-full-function-validation-runner";

export async function GET() {
  const runner = getWebsiteFullFunctionValidationRunner();

  return NextResponse.json({
    ok: true,
    phase: "v23.6 Phase 256",
    service: "Website Full-Function Validation Runner",
    runner,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const validation = runWebsiteFullFunctionValidation(body || {});

  return NextResponse.json({
    ok: true,
    phase: "v23.6 Phase 256",
    service: "Website Full-Function Validation Preview",
    validation,
  });
}
