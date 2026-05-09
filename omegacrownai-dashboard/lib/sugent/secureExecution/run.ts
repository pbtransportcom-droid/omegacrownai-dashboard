import { prisma } from "@/lib/db";
import { RuntimeHub } from "@/lib/sugent/runtime/hub";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";
import { recordTimelineEvent } from "@/lib/sugent/runtime/timeline";
import { sha256 } from "./hash";
import { validateExecutionRequest } from "./policy";
import { getProjectExecutionPolicy } from "./projectPolicy";
import { runJavaScriptSandbox } from "./jsSandbox";

export async function runSecureExecution({
  projectId,
  sessionId,
  runtimeSessionId,
  language,
  code,
  input,
}: {
  projectId?: string | null;
  sessionId?: string | null;
  runtimeSessionId?: string | null;
  language: string;
  code: string;
  input?: any;
}) {
  const normalizedLanguage = String(language || "javascript").toLowerCase().trim();
  const normalizedCode = String(code || "");
  const safeInput = input ?? {};

  const codeHash = sha256(normalizedCode);
  const inputHash = sha256(safeInput);

  const executionPolicy = await getProjectExecutionPolicy(projectId || null);

  const validation = validateExecutionRequest({
    language: normalizedLanguage,
    code: normalizedCode,
    input: safeInput,
    policy: executionPolicy,
  });

  const record = await prisma.executionRecord.create({
    data: {
      projectId: projectId || null,
      sessionId: sessionId || null,
      runtimeSessionId: runtimeSessionId || null,
      language: normalizedLanguage,
      status: validation.ok ? "running" : "blocked",
      code: normalizedCode,
      codeHash,
      inputHash,
      input: safeInput,
      logs: [],
      metrics: {},
      policy: validation.policy,
      error: validation.ok ? null : validation.error,
    },
  });

  if (runtimeSessionId) {
    RuntimeHub.emit(runtimeSessionId, {
      type: "tool_call",
      tool: "secure_execution",
      args: {
        executionId: record.id,
        language: normalizedLanguage,
        codeHash,
        inputHash,
      },
    });
  }

  if (runtimeSessionId) {
    await recordTimelineEvent({
      sessionId: runtimeSessionId,
      projectId: projectId || null,
      message: {
        type: "tool_call",
        tool: "secure_execution",
        args: {
          executionId: record.id,
          language: normalizedLanguage,
          codeHash,
          inputHash,
          phase: "started",
        },
      },
    });
  }

  if (!validation.ok) {
    if (projectId) {
      await AuditLogger.log({
        projectId,
        actorType: "system",
        actorId: "secure_execution",
        action: "SAFETY_BLOCKED",
        metadata: {
          executionId: record.id,
          error: validation.error,
          codeHash,
          inputHash,
        },
      });
    }

    return {
      ok: false,
      record,
      error: validation.error,
    };
  }

  const result =
    normalizedLanguage === "javascript"
      ? await runJavaScriptSandbox({
          code: normalizedCode,
          input: safeInput,
          policy: validation.policy,
        })
      : {
          ok: false,
          output: null,
          logs: [],
          error: `Unsupported language: ${normalizedLanguage}`,
          metrics: {},
        };

  const outputHash = result.ok ? sha256(result.output ?? {}) : null;

  const updated = await prisma.executionRecord.update({
    where: { id: record.id },
    data: {
      status: result.ok ? "success" : "error",
      output: result.output ?? undefined,
      outputHash,
      logs: result.logs || [],
      error: result.ok ? null : result.error || "Execution failed.",
      metrics: result.metrics || {},
    },
  });

  if (runtimeSessionId) {
    RuntimeHub.emit(runtimeSessionId, {
      type: "tool_result",
      tool: "secure_execution",
      result: {
        executionId: updated.id,
        status: updated.status,
        codeHash,
        inputHash,
        outputHash,
        output: updated.output,
        error: updated.error,
      },
    });
  }

  if (runtimeSessionId) {
    await recordTimelineEvent({
      sessionId: runtimeSessionId,
      projectId: projectId || null,
      message: {
        type: "tool_result",
        tool: "secure_execution",
        result: {
          executionId: updated.id,
          status: updated.status,
          codeHash,
          inputHash,
          outputHash,
          output: updated.output,
          error: updated.error,
          phase: "completed",
        },
      },
    });
  }

  if (projectId) {
    await AuditLogger.log({
      projectId,
      actorType: "system",
      actorId: "secure_execution",
      action: result.ok ? "SAFETY_CHECKED" : "SAFETY_BLOCKED",
      metadata: {
        executionId: updated.id,
        status: updated.status,
        codeHash,
        inputHash,
        outputHash,
      },
    });
  }

  return {
    ok: result.ok,
    record: updated,
    error: result.ok ? null : result.error,
  };
}
