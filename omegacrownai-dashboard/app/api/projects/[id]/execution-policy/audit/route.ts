import { NextResponse } from "next/server";
import { runExecutionHardeningChecks } from "@/lib/sugent/secureExecution/hardening";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";

async function runAudit(projectId: string) {
  const report = await runExecutionHardeningChecks(projectId);

  await AuditLogger.log({
    projectId,
    actorType: "system",
    actorId: "secure_execution_hardening",
    action: report.ok ? "SAFETY_CHECKED" : "SAFETY_BLOCKED",
    metadata: {
      action: "execution_policy_audit",
      summary: report.summary,
    },
  });

  return report;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await runAudit(id);

  return NextResponse.json(report, {
    status: report.ok ? 200 : 400,
  });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await runAudit(id);

  return NextResponse.json(report, {
    status: report.ok ? 200 : 400,
  });
}
