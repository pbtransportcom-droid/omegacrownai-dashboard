export type PlanName =
  | "free"
  | "pro"
  | "elite"
  | "enterprise";

export const FEATURE_LIMITS = {
  free: {
    copilotPerDay: 10,
    portfolios: 1,
    scannerRequestsPerMonth: 100,
  },

  pro: {
    copilotPerDay: -1,
    portfolios: 10,
    scannerRequestsPerMonth: -1,
  },

  elite: {
    copilotPerDay: -1,
    portfolios: 100,
    scannerRequestsPerMonth: -1,
    apiAccess: true,
    priorityProcessing: true,
  },

  enterprise: {
    copilotPerDay: -1,
    portfolios: -1,
    scannerRequestsPerMonth: -1,
    apiAccess: true,
    priorityProcessing: true,
    organizations: true,
  },
};

export function getPlanLimits(plan: PlanName = "free") {
  return FEATURE_LIMITS[plan];
}

export function canUseFeature(
  plan: PlanName,
  feature: string,
  currentUsage: number
) {
  const limits = FEATURE_LIMITS[plan] as any;

  const limit = limits[feature];

  if (limit === undefined) {
    return false;
  }

  if (limit === -1) {
    return true;
  }

  return currentUsage < limit;
}
