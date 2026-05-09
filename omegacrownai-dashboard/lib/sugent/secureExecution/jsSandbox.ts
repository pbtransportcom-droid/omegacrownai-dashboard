import vm from "node:vm";
import { defaultExecutionPolicy, type ExecutionPolicy } from "./policy";

function safeSerialize(value: any, maxChars: number) {
  try {
    const text = typeof value === "string" ? value : JSON.stringify(value);
    if (text.length <= maxChars) return value;

    return {
      truncated: true,
      preview: text.slice(0, maxChars),
      originalLength: text.length,
    };
  } catch {
    return String(value).slice(0, maxChars);
  }
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object") return value;

  Object.freeze(value);

  for (const key of Object.keys(value as any)) {
    const child = (value as any)[key];
    if (child && typeof child === "object" && !Object.isFrozen(child)) {
      deepFreeze(child);
    }
  }

  return value;
}

export async function runJavaScriptSandbox({
  code,
  input,
  policy = defaultExecutionPolicy,
}: {
  code: string;
  input: any;
  policy?: ExecutionPolicy;
}) {
  const logs: string[] = [];
  const startedAt = Date.now();

  const safeInput = deepFreeze(JSON.parse(JSON.stringify(input ?? {})));

  const sandbox = {
    input: safeInput,
    console: {
      log: (...args: any[]) => {
        const line = args
          .map((item) => {
            try {
              return typeof item === "string" ? item : JSON.stringify(item);
            } catch {
              return String(item);
            }
          })
          .join(" ");

        const current = logs.join("\n");
        if (current.length + line.length <= policy.maxLogChars) {
          logs.push(line);
        }
      },
    },

    JSON,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,

    require: undefined,
    process: undefined,
    fetch: undefined,
    XMLHttpRequest: undefined,
    WebSocket: undefined,
    eval: undefined,
    Function: undefined,
    globalThis: undefined,
  };

  const context = vm.createContext(sandbox, {
    name: "SugentSecureExecution",
    codeGeneration: {
      strings: false,
      wasm: false,
    },
  });

  const wrappedCode = `
    (async () => {
      "use strict";
      ${code}
    })()
  `;

  try {
    const script = new vm.Script(wrappedCode, {
      filename: "sugent-secure-execution.js",
    });

    const promise = script.runInContext(context, {
      timeout: policy.timeoutMs,
      displayErrors: true,
    });

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Execution timed out.")), policy.timeoutMs)
    );

    const output = await Promise.race([promise, timeout]);

    return {
      ok: true,
      output: safeSerialize(output ?? {}, policy.maxOutputChars),
      logs,
      metrics: {
        durationMs: Date.now() - startedAt,
        timeoutMs: policy.timeoutMs,
        logLines: logs.length,
      },
    };
  } catch (error: any) {
    return {
      ok: false,
      output: null,
      logs,
      error: error?.message || String(error),
      metrics: {
        durationMs: Date.now() - startedAt,
        timeoutMs: policy.timeoutMs,
        logLines: logs.length,
      },
    };
  }
}
