import { runSecureExecution } from "./run";

export function shouldUseSecureExecution(message: string) {
  const text = String(message || "").toLowerCase();

  return [
    "run sandbox",
    "sandbox this",
    "secure execution",
    "execute safely",
    "run safely",
    "calculate safely",
    "validate this code",
    "test this function",
    "run this javascript",
    "run js",
    "execute javascript",
    "sandboxed logic",
  ].some((phrase) => text.includes(phrase));
}

export function extractJavaScriptFromMessage(message: string) {
  const text = String(message || "");

  const fenced = text.match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]?.trim()) return fenced[1].trim();

  const afterCode = text.match(/code\s*:\s*([\s\S]*?)(?:\s+input\s*:|$)/i);
  if (afterCode?.[1]?.trim()) return afterCode[1].trim();

  const returnMatch = text.match(/return\s+[\s\S]*?;?$/i);
  if (returnMatch?.[0]?.trim()) return returnMatch[0].trim();

  return "";
}

export function extractJsonInputFromMessage(message: string) {
  const text = String(message || "");
  const inputIndex = text.toLowerCase().lastIndexOf("input:");

  if (inputIndex === -1) return {};

  const afterInput = text.slice(inputIndex + "input:".length).trim();

  try {
    return JSON.parse(afterInput);
  } catch {
    const jsonMatch = afterInput.match(/(\{[\s\S]*\})/);
    if (jsonMatch?.[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {}
    }
  }

  return {};
}

export async function runAgentSecureExecutionTool({
  projectId,
  sessionId,
  runtimeSessionId,
  message,
}: {
  projectId?: string | null;
  sessionId?: string | null;
  runtimeSessionId?: string | null;
  message: string;
}) {
  const code =
    extractJavaScriptFromMessage(message) ||
    'return { ok: true, note: "No explicit JavaScript code was provided.", input };';

  const input = extractJsonInputFromMessage(message);

  const result = await runSecureExecution({
    projectId: projectId || null,
    sessionId: sessionId || null,
    runtimeSessionId: runtimeSessionId || null,
    language: "javascript",
    code,
    input,
  });

  return {
    ...result,
    tool: "secure_execution",
    code,
    input,
  };
}
