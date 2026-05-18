import { NextResponse } from "next/server";
import { getBuilderUiFullFunctionOutputPanel } from "@/lib/sovereign/builder-ui-full-function-output-panel";

export async function GET() {
  const panel = getBuilderUiFullFunctionOutputPanel();

  return NextResponse.json({
    ok: true,
    phase: "v24.2 Phase 262",
    service: "Builder UI Full-Function Output Panel",
    panel,
  });
}
