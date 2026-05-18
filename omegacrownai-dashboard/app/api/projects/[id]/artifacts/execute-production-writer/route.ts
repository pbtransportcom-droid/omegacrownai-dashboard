import { NextRequest, NextResponse } from "next/server";
import { executeProductionArtifactWriter } from "@/lib/sovereign/production-artifact-writer-execution-route";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const result = executeProductionArtifactWriter({
    projectId: id,
    prompt: body.prompt,
    requestedBy: body.requestedBy,
    requestedType: body.requestedType,
  });

  return NextResponse.json(result);
}
