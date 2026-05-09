export type BrowserPolicy = {
  allowedProtocols: string[];
  blockedHosts: string[];
  maxHtmlChars: number;
  maxTextChars: number;
  timeoutMs: number;
  maxActions: number;
  maxWaitMs: number;
  blockedSelectors: string[];
};

export const defaultBrowserPolicy: BrowserPolicy = {
  allowedProtocols: ["http:", "https:"],
  blockedHosts: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "169.254.169.254"
  ],
  maxHtmlChars: 120000,
  maxTextChars: 30000,
  timeoutMs: 15000,
  maxActions: 12,
  maxWaitMs: 5000,
  blockedSelectors: [
    "input[type=password]",
    "input[name*=password]",
    "input[name*=token]",
    "input[name*=secret]"
  ],
};

export function validateBrowserUrl(url: string, policy = defaultBrowserPolicy) {
  try {
    const parsed = new URL(url);

    if (!policy.allowedProtocols.includes(parsed.protocol)) {
      return {
        ok: false,
        error: `Protocol not allowed: ${parsed.protocol}`,
        policy,
      };
    }

    const hostname = parsed.hostname.toLowerCase();

    if (policy.blockedHosts.includes(hostname)) {
      return {
        ok: false,
        error: `Host blocked by browser policy: ${hostname}`,
        policy,
      };
    }

    if (
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".localhost")
    ) {
      return {
        ok: false,
        error: `Private/internal host blocked: ${hostname}`,
        policy,
      };
    }

    return {
      ok: true,
      policy,
    };
  } catch {
    return {
      ok: false,
      error: "Invalid URL.",
      policy,
    };
  }
}


export function validateBrowserAction(action: any, policy = defaultBrowserPolicy) {
  if (!action || typeof action !== "object") {
    return { ok: false, error: "Invalid browser action.", policy };
  }

  const type = String(action.type || "");

  if (!["navigate", "extract", "click", "type", "waitFor", "screenshot"].includes(type)) {
    return { ok: false, error: `Browser action not allowed: ${type}`, policy };
  }

  if (action.selector) {
    const selector = String(action.selector).toLowerCase();

    for (const blocked of policy.blockedSelectors) {
      if (selector.includes(blocked.toLowerCase())) {
        return {
          ok: false,
          error: `Selector blocked by browser policy: ${blocked}`,
          policy,
        };
      }
    }
  }

  if (type === "navigate") {
    return validateBrowserUrl(String(action.url || ""), policy);
  }

  if (type === "waitFor" && action.ms && Number(action.ms) > policy.maxWaitMs) {
    return {
      ok: false,
      error: `waitFor exceeds maxWaitMs ${policy.maxWaitMs}.`,
      policy,
    };
  }

  return { ok: true, policy };
}

export function validateBrowserActions(actions: any[], policy = defaultBrowserPolicy) {
  if (!Array.isArray(actions)) {
    return { ok: false, error: "Actions must be an array.", policy };
  }

  if (actions.length > policy.maxActions) {
    return {
      ok: false,
      error: `Too many browser actions. Max is ${policy.maxActions}.`,
      policy,
    };
  }

  for (const action of actions) {
    const result = validateBrowserAction(action, policy);
    if (!result.ok) return result;
  }

  return { ok: true, policy };
}
