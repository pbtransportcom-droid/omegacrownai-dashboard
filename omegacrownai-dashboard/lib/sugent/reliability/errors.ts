export type OmegaErrorKind =
  | "TRANSIENT_INFRA_ERROR"
  | "TRANSIENT_LLM_ERROR"
  | "PERMANENT_LOGIC_ERROR"
  | "SAFETY_VETO_ERROR"
  | "HUMAN_ACTION_REQUIRED_ERROR"
  | "UNKNOWN_ERROR";

export class TransientInfraError extends Error {
  readonly kind = "TRANSIENT_INFRA_ERROR";
}

export class TransientLLMError extends Error {
  readonly kind = "TRANSIENT_LLM_ERROR";
}

export class PermanentLogicError extends Error {
  readonly kind = "PERMANENT_LOGIC_ERROR";
}

export class SafetyVetoError extends Error {
  readonly kind = "SAFETY_VETO_ERROR";
}

export class HumanActionRequiredError extends Error {
  readonly kind = "HUMAN_ACTION_REQUIRED_ERROR";
}

export function getErrorKind(error: any): OmegaErrorKind {
  const kind = error?.kind || error?.errorKind;

  if (
    kind === "TRANSIENT_INFRA_ERROR" ||
    kind === "TRANSIENT_LLM_ERROR" ||
    kind === "PERMANENT_LOGIC_ERROR" ||
    kind === "SAFETY_VETO_ERROR" ||
    kind === "HUMAN_ACTION_REQUIRED_ERROR"
  ) {
    return kind;
  }

  return "UNKNOWN_ERROR";
}

export function isRetryableErrorKind(kind: OmegaErrorKind) {
  return (
    kind === "TRANSIENT_INFRA_ERROR" ||
    kind === "TRANSIENT_LLM_ERROR" ||
    kind === "UNKNOWN_ERROR"
  );
}

export function shouldDeadLetterImmediately(kind: OmegaErrorKind) {
  return (
    kind === "PERMANENT_LOGIC_ERROR" ||
    kind === "SAFETY_VETO_ERROR" ||
    kind === "HUMAN_ACTION_REQUIRED_ERROR"
  );
}
