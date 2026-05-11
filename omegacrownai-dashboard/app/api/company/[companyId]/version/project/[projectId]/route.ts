import { NextResponse } from "next/server";
import { listProjectVersions } from "@/lib/sugent/versioning/versionEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string }> }
) {
  const { companyId, projectId } = await params;

  const versions = await listProjectVersions({
    companyId,
    projectId,
  });

  return NextResponse.json({
    ok: true,
    versions,
  });
}
