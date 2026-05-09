export type BrowserPolicy = {
  allowedProtocols: string[];
  blockedHosts: string[];
  maxHtmlChars: number;
  maxTextChars: number;
  timeoutMs: number;
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
