import { NextResponse } from "next/server";
import { getWorkspaceDashboard } from "@/lib/sugent/workspaces/workspaceEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const data = await getWorkspaceDashboard(companyId);

  return NextResponse.json(data);
}
