import { NextResponse } from "next/server";
import { getFullStackBuilderRuntime } from "@/lib/sovereign/full-stack-builder-runtime";

export async function GET() {
  const runtime = getFullStackBuilderRuntime();

  return NextResponse.json({
    ok: true,
    phase: "v23.0 Phase 250",
    service: "Full-Stack Website/App Builder Runtime",
    runtime,
  });
}
