import { prisma } from "@/lib/db";
import { runJavaScriptSandbox } from "./jsSandbox";
import { sha256 } from "./hash";
import { validateExecutionRequest } from "./policy";

export async function replayExecution(executionId: string) {
  const original = await prisma.executionRecord.findUnique({
    where: { id: executionId },
  });

  if (!original) {
    return {
      ok: false,
      error: "Execution record not found.",
    };
  }

  const validation = validateExecutionRequest({
    language: original.language,
    code: original.code,
    input: original.input,
    policy: original.policy as any,
  });

  if (!validation.ok) {
    return {
      ok: false,
      original,
      error: validation.error,
      replay: {
        status: "blocked",
      },
    };
  }

  const result =
    original.language === "javascript"
      ? await runJavaScriptSandbox({
          code: original.code,
          input: original.input,
          policy: validation.policy,
        })
      : {
          ok: false,
          output: null,
          logs: [],
          error: `Unsupported language: ${original.language}`,
          metrics: {},
        };

  const replayOutputHash = result.ok ? sha256(result.output ?? {}) : null;

  return {
    ok: result.ok,
    original,
    replay: {
      status: result.ok ? "success" : "error",
      output: result.output,
      outputHash: replayOutputHash,
      logs: result.logs,
      error: result.ok ? null : result.error,
      metrics: result.metrics,
      deterministicMatch:
        Boolean(original.outputHash) &&
        Boolean(replayOutputHash) &&
        original.outputHash === replayOutputHash,
    },
  };
}
