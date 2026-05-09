export type CloudProvider = "local" | "aws" | "gcp" | "azure" | "vercel" | "fly";

export type CloudExecutionPolicy = {
  allowedProviders: CloudProvider[];
  maxPayloadChars: number;
  maxOutputChars: number;
  allowExternalDispatch: boolean;
};

export const defaultCloudExecutionPolicy: CloudExecutionPolicy = {
  allowedProviders: ["local", "aws", "gcp", "azure", "vercel", "fly"],
  maxPayloadChars: 50000,
  maxOutputChars: 50000,
  allowExternalDispatch: false,
};

export function detectProvider(message: string): CloudProvider {
  const text = String(message || "").toLowerCase();

  if (text.includes("aws")) return "aws";
  if (text.includes("gcp") || text.includes("google cloud")) return "gcp";
  if (text.includes("azure")) return "azure";
  if (text.includes("vercel")) return "vercel";
  if (text.includes("fly.io") || text.includes(" fly ")) return "fly";

  return "local";
}

export function validateCloudJob({
  provider,
  payload,
  policy = defaultCloudExecutionPolicy,
}: {
  provider: string;
  payload: any;
  policy?: CloudExecutionPolicy;
}) {
  if (!policy.allowedProviders.includes(provider as CloudProvider)) {
    return {
      ok: false,
      error: `Cloud provider not allowed: ${provider}`,
      policy,
    };
  }

  const payloadText = JSON.stringify(payload ?? {});

  if (payloadText.length > policy.maxPayloadChars) {
    return {
      ok: false,
      error: `Cloud payload exceeds maxPayloadChars ${policy.maxPayloadChars}.`,
      policy,
    };
  }

  return {
    ok: true,
    policy,
  };
}
