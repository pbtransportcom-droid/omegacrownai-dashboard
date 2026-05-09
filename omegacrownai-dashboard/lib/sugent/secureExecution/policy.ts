export type ExecutionPolicy = {
  allowedLanguages: string[];
  timeoutMs: number;
  maxCodeChars: number;
  maxInputChars: number;
  maxOutputChars: number;
  maxLogChars: number;
  forbiddenPatterns: string[];
};

export const defaultExecutionPolicy: ExecutionPolicy = {
  allowedLanguages: ["javascript"],
  timeoutMs: 300,
  maxCodeChars: 8000,
  maxInputChars: 16000,
  maxOutputChars: 20000,
  maxLogChars: 12000,
  forbiddenPatterns: [
    "require(",
    "import ",
    "process",
    "child_process",
    "fs.",
    "fs/",
    "fetch(",
    "XMLHttpRequest",
    "WebSocket",
    "eval(",
    "Function(",
    "globalThis",
    "constructor.constructor",
  ],
};

export function validateExecutionRequest({
  language,
  code,
  input,
  policy = defaultExecutionPolicy,
}: {
  language: string;
  code: string;
  input: any;
  policy?: ExecutionPolicy;
}) {
  const normalizedLanguage = String(language || "").toLowerCase().trim();
  const normalizedCode = String(code || "");

  if (!policy.allowedLanguages.includes(normalizedLanguage)) {
    return {
      ok: false,
      error: `Language not allowed: ${normalizedLanguage}`,
      policy,
    };
  }

  if (!normalizedCode.trim()) {
    return {
      ok: false,
      error: "Code is required.",
      policy,
    };
  }

  if (normalizedCode.length > policy.maxCodeChars) {
    return {
      ok: false,
      error: `Code exceeds maxCodeChars ${policy.maxCodeChars}.`,
      policy,
    };
  }

  const inputText = JSON.stringify(input ?? {});
  if (inputText.length > policy.maxInputChars) {
    return {
      ok: false,
      error: `Input exceeds maxInputChars ${policy.maxInputChars}.`,
      policy,
    };
  }

  const lowerCode = normalizedCode.toLowerCase();

  for (const pattern of policy.forbiddenPatterns) {
    if (lowerCode.includes(pattern.toLowerCase())) {
      return {
        ok: false,
        error: `Forbidden pattern detected: ${pattern}`,
        policy,
      };
    }
  }

  return {
    ok: true,
    policy,
  };
}
