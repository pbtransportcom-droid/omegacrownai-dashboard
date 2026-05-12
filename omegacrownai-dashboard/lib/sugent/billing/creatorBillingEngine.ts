import { prisma } from "@/lib/db";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";

export type CreatorPlanTier = "starter" | "pro" | "studio" | "enterprise";

export function currentPeriodKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function usageWorkspaceKey(workspaceId?: string | null) {
  return workspaceId || "company";
}

export function planLimits(tier: string) {
  if (tier === "enterprise") {
    return {
      monthlyRenderLimit: 10000,
      monthlyVideoExportLimit: 5000,
      monthlyPodcastExportLimit: 5000,
      monthlyDistributionLimit: 10000,
      storageMbLimit: 102400,
      overageAllowed: true,
    };
  }

  if (tier === "studio") {
    return {
      monthlyRenderLimit: 500,
      monthlyVideoExportLimit: 250,
      monthlyPodcastExportLimit: 250,
      monthlyDistributionLimit: 500,
      storageMbLimit: 51200,
      overageAllowed: true,
    };
  }

  if (tier === "pro") {
    return {
      monthlyRenderLimit: 100,
      monthlyVideoExportLimit: 50,
      monthlyPodcastExportLimit: 50,
      monthlyDistributionLimit: 100,
      storageMbLimit: 10240,
      overageAllowed: false,
    };
  }

  return {
    monthlyRenderLimit: 25,
    monthlyVideoExportLimit: 10,
    monthlyPodcastExportLimit: 10,
    monthlyDistributionLimit: 25,
    storageMbLimit: 1024,
    overageAllowed: false,
  };
}

export async function getOrCreateCreatorBillingPlan(companyId: string, workspaceId?: string | null) {
  const existing = await prisma.creatorBillingPlan.findFirst({
    where: {
      companyId,
      workspaceId: workspaceId || null,
      status: "active",
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing;

  const limits = planLimits("starter");

  return prisma.creatorBillingPlan.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      name: "Creator Starter",
      tier: "starter",
      status: "active",
      ...limits,
      metadata: {
        source: "phase58_default_plan",
      },
      createdBy: "system",
    },
  });
}

export async function upsertCreatorBillingPlan({
  companyId,
  workspaceId,
  tier = "starter",
  createdBy = "system-owner",
}: {
  companyId: string;
  workspaceId?: string | null;
  tier?: CreatorPlanTier | string;
  createdBy?: string | null;
}) {
  const limits = planLimits(tier);
  const name = `Creator ${String(tier).charAt(0).toUpperCase()}${String(tier).slice(1)}`;

  const existing = await prisma.creatorBillingPlan.findFirst({
    where: {
      companyId,
      workspaceId: workspaceId || null,
      status: "active",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!existing) {
    return prisma.creatorBillingPlan.create({
      data: {
        companyId,
        workspaceId: workspaceId || null,
        name,
        tier,
        status: "active",
        ...limits,
        metadata: {
          source: "phase58_plan_upsert",
        },
        createdBy: createdBy || "system-owner",
      },
    });
  }

  return prisma.creatorBillingPlan.update({
    where: { id: existing.id },
    data: {
      name,
      tier,
      ...limits,
      metadata: {
        source: "phase58_plan_upsert",
        updatedAt: new Date().toISOString(),
      },
    },
  });
}

function limitForUsageType(plan: any, usageType: string) {
  if (usageType === "render") return plan.monthlyRenderLimit;
  if (usageType === "video_export") return plan.monthlyVideoExportLimit;
  if (usageType === "podcast_export") return plan.monthlyPodcastExportLimit;
  if (usageType === "distribution") return plan.monthlyDistributionLimit;
  return 0;
}

export async function getUsageCounter({
  companyId,
  workspaceId,
  usageType,
  periodKey = currentPeriodKey(),
}: {
  companyId: string;
  workspaceId?: string | null;
  usageType: string;
  periodKey?: string;
}) {
  const plan = await getOrCreateCreatorBillingPlan(companyId, workspaceId || null);
  const limit = limitForUsageType(plan, usageType);

  const counter = await prisma.creatorUsageCounter.upsert({
    where: {
      companyId_workspaceId_periodKey_usageType: {
        companyId,
        workspaceId: usageWorkspaceKey(workspaceId),
        periodKey,
        usageType,
      },
    },
    create: {
      companyId,
      workspaceId: usageWorkspaceKey(workspaceId),
      periodKey,
      usageType,
      used: 0,
      limit,
      status: "active",
      metadata: {
        source: "phase58_usage_counter",
      },
    },
    update: {
      limit,
    },
  });

  return { plan, counter };
}

export async function checkCreatorUsageLimit({
  companyId,
  workspaceId,
  usageType,
  amount = 1,
}: {
  companyId: string;
  workspaceId?: string | null;
  usageType: string;
  amount?: number;
}) {
  const { plan, counter } = await getUsageCounter({
    companyId,
    workspaceId: workspaceId || null,
    usageType,
  });

  const nextUsed = counter.used + amount;
  const allowed = plan.overageAllowed || counter.limit <= 0 || nextUsed <= counter.limit;

  return {
    ok: allowed,
    status: allowed ? "ALLOWED" : "LIMIT_EXCEEDED",
    plan,
    counter,
    usageType,
    amount,
    nextUsed,
    limit: counter.limit,
    remaining: Math.max(counter.limit - counter.used, 0),
    reason: allowed
      ? "Creator usage allowed."
      : `Creator usage limit exceeded for ${usageType}: ${counter.used}/${counter.limit}.`,
  };
}

export async function recordCreatorUsage({
  companyId,
  workspaceId,
  usageType,
  amount = 1,
  entityType,
  entityId,
  metadata,
}: {
  companyId: string;
  workspaceId?: string | null;
  usageType: string;
  amount?: number;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: any;
}) {
  const periodKey = currentPeriodKey();
  const { counter } = await getUsageCounter({
    companyId,
    workspaceId: workspaceId || null,
    usageType,
    periodKey,
  });

  const updated = await prisma.creatorUsageCounter.update({
    where: { id: counter.id },
    data: {
      used: { increment: amount },
      metadata: {
        ...(counter.metadata as any || {}),
        lastRecordedAt: new Date().toISOString(),
      },
    },
  });

  await prisma.creatorUsageEvent.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      periodKey,
      usageType,
      amount,
      status: "recorded",
      entityType: entityType || null,
      entityId: entityId || null,
      message: `Recorded ${amount} ${usageType} usage.`,
      metadata: metadata || {},
    },
  });

  return updated;
}

export async function recordCreatorUsageBlocked({
  companyId,
  workspaceId,
  usageType,
  entityType,
  entityId,
  reason,
  metadata,
}: {
  companyId: string;
  workspaceId?: string | null;
  usageType: string;
  entityType?: string | null;
  entityId?: string | null;
  reason: string;
  metadata?: any;
}) {
  const periodKey = currentPeriodKey();

  await prisma.creatorUsageEvent.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      periodKey,
      usageType,
      amount: 0,
      status: "blocked",
      entityType: entityType || null,
      entityId: entityId || null,
      message: reason,
      metadata: metadata || {},
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    projectId: metadata?.projectId || null,
    actorId: metadata?.actorId || "system-owner",
    actorType: metadata?.actorType || "system",
    action: "CREATOR_USAGE_LIMIT_BLOCKED",
    entityType: entityType || "CreatorUsageCounter",
    entityId: entityId || usageType,
    severity: "warning",
    metadata: {
      usageType,
      reason,
      ...(metadata || {}),
    },
  });
}

export async function getCreatorBillingDashboard(companyId: string, workspaceId?: string | null) {
  const periodKey = currentPeriodKey();
  const plan = await getOrCreateCreatorBillingPlan(companyId, workspaceId || null);

  const usageTypes = ["render", "video_export", "podcast_export", "distribution"];

  const counters = await Promise.all(
    usageTypes.map(async (usageType) => {
      const result = await getUsageCounter({
        companyId,
        workspaceId: workspaceId || null,
        usageType,
        periodKey,
      });

      return result.counter;
    })
  );

  const events = await prisma.creatorUsageEvent.findMany({
    where: {
      companyId,
      workspaceId: workspaceId || null,
      periodKey,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return {
    ok: true,
    companyId,
    workspaceId: workspaceId || null,
    periodKey,
    plan,
    counters,
    events,
    summary: {
      tier: plan.tier,
      overageAllowed: plan.overageAllowed,
      counters: counters.length,
      blockedEvents: events.filter((event) => event.status === "blocked").length,
      usage: counters.map((counter) => ({
        usageType: counter.usageType,
        used: counter.used,
        limit: counter.limit,
        remaining: Math.max(counter.limit - counter.used, 0),
        percent: counter.limit > 0 ? Math.round((counter.used / counter.limit) * 100) : 0,
      })),
    },
  };
}
