export type UsageCategory =
  | "copilot"
  | "scanner"
  | "portfolio"
  | "journal"
  | "video"
  | "voice"
  | "runtime"
  | "app-generator";

export type UsageRecord = {
  category: UsageCategory;
  userId: string;
  timestamp: string;
};

const usageStore: UsageRecord[] = [];

export function trackUsage(
  userId: string,
  category: UsageCategory
) {
  usageStore.push({
    userId,
    category,
    timestamp: new Date().toISOString(),
  });

  return {
    ok: true,
    total: usageStore.length,
  };
}

export function getUsage(userId: string) {
  const userRecords = usageStore.filter(
    (r) => r.userId === userId
  );

  const summary = userRecords.reduce(
    (acc: Record<string, number>, item) => {
      acc[item.category] =
        (acc[item.category] || 0) + 1;
      return acc;
    },
    {}
  );

  return {
    userId,
    totalRequests: userRecords.length,
    usage: summary,
  };
}
