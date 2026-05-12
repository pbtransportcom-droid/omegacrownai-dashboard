import { NextResponse } from "next/server";
import { ensureRuntimePolicyRules } from "@/lib/sugent/runtime-policy/runtimePolicyEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const rules = await ensureRuntimePolicyRules({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
  });

  return NextResponse.json({
    ok: true,
    rules,
  });
}
