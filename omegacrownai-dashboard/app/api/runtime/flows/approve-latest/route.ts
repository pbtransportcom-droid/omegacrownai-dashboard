import { NextResponse } from "next/server";
import { approveLatestVersion } from "@/lib/sugent/runtime/pipelineRuntime";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.companyId || !body.projectId) {
    return NextResponse.json(
      { ok: false, error: "companyId and projectId are required" },
      { status: 400 }
    );
  }

  const result = await approveLatestVersion({
    companyId: String(body.companyId),
    projectId: String(body.projectId),
    projectType: body.projectType === "podcast" ? "podcast" : "video",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
