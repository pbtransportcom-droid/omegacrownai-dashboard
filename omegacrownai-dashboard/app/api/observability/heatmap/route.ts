import { NextResponse } from "next/server";
import { getObservabilityHeatmap } from "@/lib/sugent/observability/observabilityEngine";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");

  const result = await getObservabilityHeatmap(companyId);

  return NextResponse.json(result);
}
