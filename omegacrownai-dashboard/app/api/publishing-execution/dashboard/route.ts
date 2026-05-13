import { NextResponse } from "next/server";
import { getPublishingExecutionDashboard } from "@/lib/sugent/publishing-execution/publishingExecutionEngine";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const result = await getPublishingExecutionDashboard(url.searchParams.get("organizationId"));
  return NextResponse.json(result);
}
