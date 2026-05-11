import { NextResponse } from "next/server";
import { getPodcastDashboard } from "@/lib/sugent/podcast/podcastEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const dashboard = await getPodcastDashboard(companyId);

  return NextResponse.json(dashboard);
}
