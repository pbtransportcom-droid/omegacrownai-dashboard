import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { defaultExecutionPolicy } from "@/lib/sugent/secureExecution/policy";
import {
  getProjectExecutionPolicy,
  upsertProjectExecutionPolicy,
} from "@/lib/sugent/secureExecution/projectPolicy";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const record = await prisma.projectExecutionPolicy.findUnique({
    where: { projectId: id },
  });

  const effectivePolicy = await getProjectExecutionPolicy(id);

  return NextResponse.json({
    ok: true,
    projectId: id,
    record,
    effectivePolicy,
    defaultPolicy: defaultExecutionPolicy,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const form = await req.formData();

  const enabled = String(form.get("enabled") || "on") === "on";

  const allowedLanguages = String(form.get("allowedLanguages") || "javascript")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const forbiddenPatterns = String(form.get("forbiddenPatterns") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const policy = {
    allowedLanguages,
    timeoutMs: Number(form.get("timeoutMs") || defaultExecutionPolicy.timeoutMs),
    maxCodeChars: Number(form.get("maxCodeChars") || defaultExecutionPolicy.maxCodeChars),
    maxInputChars: Number(form.get("maxInputChars") || defaultExecutionPolicy.maxInputChars),
    maxOutputChars: Number(form.get("maxOutputChars") || defaultExecutionPolicy.maxOutputChars),
    maxLogChars: Number(form.get("maxLogChars") || defaultExecutionPolicy.maxLogChars),
    forbiddenPatterns: forbiddenPatterns.length
      ? forbiddenPatterns
      : defaultExecutionPolicy.forbiddenPatterns,
  };

  const saved = await upsertProjectExecutionPolicy({
    projectId: id,
    enabled,
    policy,
  });

  await AuditLogger.log({
    projectId: id,
    actorType: "system",
    actorId: "secure_execution_policy",
    action: "SAFETY_CHECKED",
    metadata: {
      action: "project_execution_policy_updated",
      enabled,
      policy,
    },
  });

  return NextResponse.redirect(new URL(`/projects/${id}/settings/execution-policy`, req.url));
}
