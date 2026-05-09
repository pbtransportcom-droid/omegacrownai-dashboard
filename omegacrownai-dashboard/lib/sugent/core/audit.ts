export type AuditAction =
  | "INTENT_DETECTED"
  | "PLAN_CREATED"
  | "BUILD_CREATED"
  | "DRAFT_CREATED"
  | "PUBLISHED"
  | "SAFETY_CHECKED"
  | "SAFETY_BLOCKED"
  | "RUNBOOK_VIEWED";

export type AuditEntry = {
  projectId: string;
  actorType: "user" | "agent" | "system";
  actorId?: string | null;
  action: AuditAction;
  metadata?: any;
};
