import { NextResponse } from "next/server";
import { ensureDeploymentProfile } from "@/lib/sugent/deployment/deploymentEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const profile = await ensureDeploymentProfile({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    name: body.name ? String(body.name) : null,
    environment: body.environment ? String(body.environment) : "production",
  });

  return NextResponse.json({
    ok: true,
    profile,
  });
}
