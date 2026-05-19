import { NextRequest, NextResponse } from "next/server";
import { simulateProductionWebsiteAppFileWrite } from "@/lib/sovereign/production-website-app-generator-file-writer";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const result = simulateProductionWebsiteAppFileWrite({
    projectId: id,
    artifactId: body.artifactId,
    requestedBy: body.requestedBy,
    artifactMode: body.artifactMode,
  });

  return NextResponse.json(result);
}
