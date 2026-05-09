import { AuditLogger } from "@/lib/sugent/core/auditLogger";

export type SafetyContext = {
  projectId?: string;
  userId?: string;
};

export const Policy = {
  async checkPublish(kind: string, draft: any, ctx: SafetyContext) {
    if (!ctx.projectId) {
      return true;
    }

    if (kind === "publish_trading") {
      const leverage = Number(draft?.risk?.leverage ?? draft?.summary?.leverage ?? 1);

      if (Number.isFinite(leverage) && leverage > 10) {
        await AuditLogger.log({
          projectId: ctx.projectId,
          actorType: "system",
          actorId: "policy_engine",
          action: "SAFETY_BLOCKED",
          metadata: {
            reason: "High leverage",
            kind,
            leverage,
            maxAllowed: 10,
          },
        });

        throw new Error("Safety policy: leverage too high.");
      }
    }

    if (kind === "publish_automation") {
      const nodes = Array.isArray(draft?.nodes) ? draft.nodes : [];
      const hasExternal = nodes.some((node: any) =>
        String(node?.type || "").toLowerCase().includes("external") ||
        String(node?.type || "").toLowerCase().includes("webhook")
      );

      if (hasExternal) {
        await AuditLogger.log({
          projectId: ctx.projectId,
          actorType: "system",
          actorId: "policy_engine",
          action: "SAFETY_BLOCKED",
          metadata: {
            reason: "External automation action requires review",
            kind,
          },
        });

        throw new Error("Safety policy: external automation actions require review.");
      }
    }

    await AuditLogger.log({
      projectId: ctx.projectId,
      actorType: "system",
      actorId: "policy_engine",
      action: "SAFETY_CHECKED",
      metadata: {
        kind,
        passed: true,
      },
    });

    return true;
  },
};
