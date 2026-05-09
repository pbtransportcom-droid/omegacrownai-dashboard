import { getProjectExecutionPolicy } from "./projectPolicy";
import { runSecureExecution } from "./run";

export type HardeningCheck = {
  id: string;
  label: string;
  expected: "success" | "blocked" | "error";
  passed: boolean;
  status?: string;
  error?: string | null;
  executionId?: string;
  details?: any;
};

function passedByExpectation(expected: HardeningCheck["expected"], result: any) {
  const status = result?.record?.status || (result?.ok ? "success" : "error");

  if (expected === "success") {
    return result?.ok === true && status === "success";
  }

  if (expected === "blocked") {
    return result?.ok === false && status === "blocked";
  }

  if (expected === "error") {
    return result?.ok === false && status === "error";
  }

  return false;
}

async function runCheck({
  id,
  label,
  expected,
  projectId,
  code,
  input = {},
  language = "javascript",
}: {
  id: string;
  label: string;
  expected: HardeningCheck["expected"];
  projectId?: string | null;
  code: string;
  input?: any;
  language?: string;
}): Promise<HardeningCheck> {
  const sessionId = `hardening-${Date.now()}-${id}`;

  const result = await runSecureExecution({
    projectId: projectId || null,
    sessionId,
    runtimeSessionId: null,
    language,
    code,
    input,
  });

  const status = result?.record?.status || undefined;
  const passed = passedByExpectation(expected, result);

  return {
    id,
    label,
    expected,
    passed,
    status,
    error: result?.error || result?.record?.error || null,
    executionId: result?.record?.id,
    details: {
      codeHash: result?.record?.codeHash,
      inputHash: result?.record?.inputHash,
      outputHash: result?.record?.outputHash,
    },
  };
}

export async function runExecutionHardeningChecks(projectId?: string | null) {
  const policy = await getProjectExecutionPolicy(projectId || null);

  const oversizedCode = `return "${"x".repeat(policy.maxCodeChars + 100)}";`;
  const oversizedInput = {
    payload: "x".repeat(policy.maxInputChars + 100),
  };

  const checks: HardeningCheck[] = [];

  checks.push(
    await runCheck({
      id: "safe_js",
      label: "Safe JavaScript execution succeeds",
      expected: "success",
      projectId,
      code: "return { ok: true, value: input.value * 2 };",
      input: { value: 21 },
    })
  );

  checks.push(
    await runCheck({
      id: "blocked_language",
      label: "Unsupported language is blocked",
      expected: "blocked",
      projectId,
      language: "python",
      code: "print('hello')",
      input: {},
    })
  );

  checks.push(
    await runCheck({
      id: "forbidden_process",
      label: "Forbidden process access is blocked",
      expected: "blocked",
      projectId,
      code: "return process.env;",
      input: {},
    })
  );

  checks.push(
    await runCheck({
      id: "forbidden_fetch",
      label: "Forbidden network fetch is blocked",
      expected: "blocked",
      projectId,
      code: "return fetch('https://example.com');",
      input: {},
    })
  );

  checks.push(
    await runCheck({
      id: "code_size_limit",
      label: "Oversized code is blocked",
      expected: "blocked",
      projectId,
      code: oversizedCode,
      input: {},
    })
  );

  checks.push(
    await runCheck({
      id: "input_size_limit",
      label: "Oversized input is blocked",
      expected: "blocked",
      projectId,
      code: "return { ok: true };",
      input: oversizedInput,
    })
  );

  checks.push(
    await runCheck({
      id: "runtime_timeout",
      label: "Runtime timeout is enforced",
      expected: "error",
      projectId,
      code: "let x = 0; for (let i = 0; i < 999999999; i++) { x += i; } return { x };",
      input: {},
    })
  );

  const passed = checks.filter((check) => check.passed).length;

  return {
    ok: passed === checks.length,
    projectId: projectId || null,
    policy,
    summary: {
      total: checks.length,
      passed,
      failed: checks.length - passed,
    },
    checks,
  };
}
