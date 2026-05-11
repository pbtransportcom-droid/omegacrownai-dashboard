import { NextResponse } from "next/server";
import { getVideoProject } from "@/lib/sugent/video/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string }> }
) {
  const { companyId, projectId } = await params;

  const project = await getVideoProject(projectId, companyId);

  if (!project) {
    return NextResponse.json(
      { ok: false, error: "VIDEO_PROJECT_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    project,
  });
}
