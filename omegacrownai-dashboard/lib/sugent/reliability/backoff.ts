import { OmegaErrorKind } from "@/lib/sugent/reliability/errors";

export function computeNextDelayMs({
  attempt,
  errorKind,
}: {
  attempt: number;
  errorKind: OmegaErrorKind;
}) {
  const jitter = Math.random() * 0.3 + 0.85;

  if (errorKind === "TRANSIENT_LLM_ERROR") {
    const baseMs = 1000;
    const maxMs = 15000;
    return Math.round(Math.min(baseMs * Math.pow(2, attempt - 1) * jitter, maxMs));
  }

  const baseMs = 5000;
  const maxMs = 5 * 60 * 1000;
  return Math.round(Math.min(baseMs * Math.pow(2, attempt - 1) * jitter, maxMs));
}
