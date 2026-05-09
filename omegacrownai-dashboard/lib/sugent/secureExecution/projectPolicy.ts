import { prisma } from "@/lib/db";
import {
  defaultExecutionPolicy,
  type ExecutionPolicy,
} from "./policy";

function normalizePolicy(value: any): ExecutionPolicy {
  const policy = {
    ...defaultExecutionPolicy,
    ...(value || {}),
  };

  policy.allowedLanguages = Array.isArray(policy.allowedLanguages)
    ? policy.allowedLanguages.map((item: any) => String(item).toLowerCase().trim()).filter(Boolean)
    : defaultExecutionPolicy.allowedLanguages;

  policy.forbiddenPatterns = Array.isArray(policy.forbiddenPatterns)
    ? policy.forbiddenPatterns.map((item: any) => String(item)).filter(Boolean)
    : defaultExecutionPolicy.forbiddenPatterns;

  policy.timeoutMs = Number(policy.timeoutMs || defaultExecutionPolicy.timeoutMs);
  policy.maxCodeChars = Number(policy.maxCodeChars || defaultExecutionPolicy.maxCodeChars);
  policy.maxInputChars = Number(policy.maxInputChars || defaultExecutionPolicy.maxInputChars);
  policy.maxOutputChars = Number(policy.maxOutputChars || defaultExecutionPolicy.maxOutputChars);
  policy.maxLogChars = Number(policy.maxLogChars || defaultExecutionPolicy.maxLogChars);

  return policy;
}

export async function getProjectExecutionPolicy(projectId?: string | null) {
  if (!projectId) {
    return defaultExecutionPolicy;
  }

  const record = await prisma.projectExecutionPolicy.findUnique({
    where: { projectId },
  });

  if (!record || !record.enabled) {
    return defaultExecutionPolicy;
  }

  return normalizePolicy(record.policy);
}

export async function upsertProjectExecutionPolicy({
  projectId,
  policy,
  enabled = true,
}: {
  projectId: string;
  policy: any;
  enabled?: boolean;
}) {
  return prisma.projectExecutionPolicy.upsert({
    where: { projectId },
    update: {
      enabled,
      policy: normalizePolicy(policy),
    },
    create: {
      projectId,
      enabled,
      policy: normalizePolicy(policy),
    },
  });
}
