import { NextResponse } from "next/server";
import { getReliabilityDashboard } from "@/lib/sugent/reliability/jobRunner";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");

  const data = await getReliabilityDashboard(companyId);

  return NextResponse.json(data);
}
