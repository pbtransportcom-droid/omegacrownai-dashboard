import { NextResponse } from "next/server";
import { runQAImprovementLoop } from "@/lib/sugent/quality/qaImprovementEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.projectId) {
    return NextResponse.json(
      { ok: false, error: "projectId is required" },
      { status: 400 }
    );
  }

  const result = await runQAImprovementLoop({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    projectId: String(body.projectId),
    projectType: body.projectType ? String(body.projectType) : "video",
    actorId: body.actorId ? String(body.actorId) : "qa-improvement",
    actorType: body.actorType ? String(body.actorType) : "system",
    targetScore: body.targetScore ? Number(body.targetScore) : 80,
    maxAttempts: body.maxAttempts ? Number(body.maxAttempts) : 3,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
