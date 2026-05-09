import { AuditLogger } from "@/lib/sugent/core/auditLogger";
import { getProjectSafetySettings } from "@/lib/sugent/brain/safetySettings";

export type SafetyContext = {
  projectId?: string;
  userId?: string;
};

export const Policy = {
  async checkPublish(kind: string, draft: any, ctx: SafetyContext) {
    if (!ctx.projectId) {
      return true;
    }

    const settings = await getProjectSafetySettings(ctx.projectId);

    if (kind === "publish_trading") {
      const leverage = Number(draft?.risk?.leverage ?? draft?.summary?.leverage ?? 1);

      if (Number.isFinite(leverage) && leverage > settings.tradingMaxLeverage) {
        await AuditLogger.log({
          projectId: ctx.projectId,
          actorType: "system",
          actorId: "policy_engine",
          action: "SAFETY_BLOCKED",
          metadata: {
            reason: "Trading leverage exceeds project limit",
            kind,
            leverage,
            maxAllowed: settings.tradingMaxLeverage,
          },
        });

        throw new Error(`Safety policy: leverage exceeds project limit (${settings.tradingMaxLeverage}).`);
      }
    }

    if (kind === "publish_automation") {
      const nodes = Array.isArray(draft?.nodes) ? draft.nodes : [];
      const hasExternal = nodes.some((node: any) => {
        const type = String(node?.type || "").toLowerCase();
        return type.includes("external") || type.includes("webhook") || type.includes("api");
      });

      if (hasExternal && !settings.automationAllowExternal) {
        await AuditLogger.log({
          projectId: ctx.projectId,
          actorType: "system",
          actorId: "policy_engine",
          action: "SAFETY_BLOCKED",
          metadata: {
            reason: "External automation actions disabled",
            kind,
          },
        });

        throw new Error("Safety policy: external automation actions are disabled for this project.");
      }
    }

    if (kind === "publish_website") {
      const allowsCustomScripts =
        Boolean(draft?.allowsCustomScripts) ||
        JSON.stringify(draft || {}).toLowerCase().includes("<script");

      if (allowsCustomScripts && !settings.websiteAllowCustomScripts) {
        await AuditLogger.log({
          projectId: ctx.projectId,
          actorType: "system",
          actorId: "policy_engine",
          action: "SAFETY_BLOCKED",
          metadata: {
            reason: "Custom scripts disabled",
            kind,
          },
        });

        throw new Error("Safety policy: custom scripts are disabled for this project.");
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
        settings: {
          tradingMaxLeverage: settings.tradingMaxLeverage,
          automationAllowExternal: settings.automationAllowExternal,
          websiteAllowCustomScripts: settings.websiteAllowCustomScripts,
          requireReviewBeforePublish: settings.requireReviewBeforePublish,
        },
      },
    });

    return true;
  },
};
