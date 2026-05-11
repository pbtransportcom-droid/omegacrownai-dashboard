import { NextResponse } from "next/server";
import { runRuntimeVideoFromBrief } from "@/lib/sugent/runtime/pipelineRuntime";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.companyId) {
    return NextResponse.json(
      { ok: false, error: "companyId is required" },
      { status: 400 }
    );
  }

  const result = await runRuntimeVideoFromBrief({
    companyId: String(body.companyId),
    brief: String(body.brief || "Create a premium OmegaCrownAI runtime video."),
    title: body.title ? String(body.title) : null,
    autoApprove: body.autoApprove === true,
  });

  return NextResponse.json({
    ok: true,
    result,
  });
}
