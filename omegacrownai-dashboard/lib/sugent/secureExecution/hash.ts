import crypto from "node:crypto";

export function stableStringify(value: any): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

export function sha256(value: any) {
  const text = typeof value === "string" ? value : stableStringify(value);
  return crypto.createHash("sha256").update(text).digest("hex");
}
