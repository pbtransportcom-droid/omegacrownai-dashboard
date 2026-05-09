export function normalizeV1Input(input: any) {
  if (!input || typeof input !== "object") {
    return { message: String(input || "") };
  }

  if (input.prompt && !input.message) {
    return {
      ...input,
      message: input.prompt,
    };
  }

  if (input.input && !input.message) {
    return {
      ...input,
      message: input.input,
    };
  }

  return input;
}

export function normalizeV1Response(result: any) {
  return {
    ok: Boolean(result?.ok),
    intent: result?.intent || "unknown",
    reply: result?.reply || "",
    plan: result?.plan || [],
    actions: result?.actions || [],
    nextSuggestions: result?.nextSuggestions || [],
    raw: result,
  };
}
