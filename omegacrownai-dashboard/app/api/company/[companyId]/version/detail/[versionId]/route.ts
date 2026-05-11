import { NextResponse } from "next/server";
import { getProjectVersion } from "@/lib/sugent/versioning/versionEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; versionId: string }> }
) {
  const { companyId, versionId } = await params;

  const version = await getProjectVersion({
    companyId,
    versionId,
  });

  if (!version) {
    return NextResponse.json(
      { ok: false, error: "PROJECT_VERSION_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    version,
  });
}
