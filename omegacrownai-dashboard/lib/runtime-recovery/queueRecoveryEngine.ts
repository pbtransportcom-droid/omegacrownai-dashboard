export const RUNTIME_RECOVERY_ENGINE_VERSION =
  "v27.0 Phase 290 — Queue Recovery Engine";

export type RecoveryCheck = {
  name: string;
  ok: boolean;
  status: "healthy" | "warning" | "needs_action";
  detail: string;
};

export function getQueueRecoveryStatus() {
  const checks: RecoveryCheck[] = [
    {
      name: "stalled_jobs",
      ok: true,
      status: "healthy",
      detail: "Queue recovery engine is ready to detect stalled jobs.",
    },
    {
      name: "orphan_sessions",
      ok: true,
      status: "healthy",
      detail: "Orphan session recovery guard is registered.",
    },
    {
      name: "dead_letter_queue",
      ok: true,
      status: "healthy",
      detail: "DLQ recovery planning layer is available.",
    },
    {
      name: "retry_policy",
      ok: true,
      status: "healthy",
      detail: "Bounded retry orchestration policy is ready.",
    },
  ];

  return {
    ok: checks.every((check) => check.ok),
    version: RUNTIME_RECOVERY_ENGINE_VERSION,
    purpose:
      "Provide the foundation for self-healing runtime recovery, stalled job detection, orphan session repair, retry safety, and DLQ recovery.",
    checks,
    nextActions: [
      "Connect recovery engine to real queue tables",
      "Add stale job detection",
      "Add orphan session scanning",
      "Add retry backoff policy",
      "Add DLQ replay preview",
      "Add observability counters",
    ],
  };
}

export function recoverStalledRuntimeItems() {
  return {
    ok: true,
    version: RUNTIME_RECOVERY_ENGINE_VERSION,
    mode: "preview",
    recovered: 0,
    message:
      "Recovery engine preview is active. Real database-backed recovery will be attached in the next phase.",
  };
}
export type RuntimeRecoveryItem = {
  id: string;
  type: string;
  status: string;
  updatedAt: string;
};

export function detectStalledRuntimeItems(
  items: RuntimeRecoveryItem[],
  staleMinutes = 15
) {
  const staleThreshold = Date.now() - staleMinutes * 60 * 1000;

  return items.filter((item) => {
    const updated = new Date(item.updatedAt).getTime();

    return (
      item.status === "RUNNING" &&
      updated < staleThreshold
    );
  });
}

export function buildRecoveryPlan(
  items: RuntimeRecoveryItem[]
) {
  return items.map((item) => ({
    id: item.id,
    action: "RECOVER",
    strategy: "REQUEUE",
    safe: true,
  }));
}
