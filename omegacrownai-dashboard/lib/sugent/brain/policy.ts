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

    if (!settings) {
      await AuditLogger.log({
        projectId: ctx.projectId,
        actorType: "system",
        actorId: "policy_engine",
        action: "SAFETY_BLOCKED",
        metadata: {
          reason: "project_safety_settings_unavailable",
          kind,
        },
      });

      throw new Error("Safety policy: project safety settings unavailable.");
    }

    if (kind === "trading") {
      const leverage = Number(draft?.risk?.leverage ?? draft?.summary?.leverage ?? 1);

      if (Number.isFinite(leverage) && leverage > settings.tradingMaxLeverage) {
        await AuditLogger.log({
          projectId: ctx.projectId,
          actorType: "system",
          actorId: "policy_engine",
          action: "SAFETY_BLOCKED",
          metadata: {
            reason: "Max leverage exceeded",
            leverage,
            max: settings.tradingMaxLeverage,
          },
        });

        throw new Error("Safety policy: max leverage exceeded.");
      }
    }

    if (kind === "automation") {
      const hasExternal =
        JSON.stringify(draft || {}).toLowerCase().includes("http") ||
        JSON.stringify(draft || {}).toLowerCase().includes("webhook");

      if (hasExternal && !settings.automationAllowExternal) {
        await AuditLogger.log({
          projectId: ctx.projectId,
          actorType: "system",
          actorId: "policy_engine",
          action: "SAFETY_BLOCKED",
          metadata: {
            reason: "External automation disabled",
            kind,
          },
        });

        throw new Error("Safety policy: external automation is disabled for this project.");
      }
    }

    if (kind === "website") {
      const allowsCustomScripts = JSON.stringify(draft || {})
        .toLowerCase()
        .includes("<script");

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
