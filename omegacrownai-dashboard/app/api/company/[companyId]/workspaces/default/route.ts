import { NextResponse } from "next/server";
import { ensureDefaultWorkspace } from "@/lib/sugent/workspaces/workspaceEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const workspace = await ensureDefaultWorkspace(companyId);

  return NextResponse.json({
    ok: true,
    workspace,
  });
}
