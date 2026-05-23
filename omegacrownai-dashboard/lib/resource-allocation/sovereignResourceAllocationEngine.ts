import { emitRuntimeEvent } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";

export const SOVEREIGN_RESOURCE_ALLOCATION_VERSION =
  "v28.6 Phase 316 — Sovereign Autonomous Resource Allocation Engine";

export type ResourcePriority = "low" | "normal" | "high" | "critical";
export type ResourceStatus = "available" | "allocated" | "constrained" | "overloaded";

export type ResourcePool = {
  poolId: string;
  name: string;
  cpuUnits: number;
  memoryUnits: number;
  executionSlots: number;
  status: ResourceStatus;
};

export type ResourceAllocation = {
  allocationId: string;
  target: string;
  priority: ResourcePriority;
  cpuUnits: number;
  memoryUnits: number;
  executionSlots: number;
  createdAt: string;
};

const resourcePools: ResourcePool[] = [
  {
    poolId: "pool_primary_runtime",
    name: "Primary Runtime Pool",
    cpuUnits: 100,
    memoryUnits: 100,
    executionSlots: 20,
    status: "available",
  },
  {
    poolId: "pool_agent_swarm",
    name: "Agent Swarm Pool",
    cpuUnits: 80,
    memoryUnits: 80,
    executionSlots: 15,
    status: "available",
  },
  {
    poolId: "pool_recovery",
    name: "Recovery Reserve Pool",
    cpuUnits: 40,
    memoryUnits: 40,
    executionSlots: 8,
    status: "available",
  },
];

const allocations: ResourceAllocation[] = [];

export function getResourceAllocationStatus() {
  return {
    ok: true,
    version: SOVEREIGN_RESOURCE_ALLOCATION_VERSION,
    purpose:
      "Manage autonomous compute budgeting, execution slot allocation, swarm resource balancing, quota enforcement, and sovereign runtime optimization.",
    pools: resourcePools,
    allocations,
    capabilities: [
      "Autonomous resource allocation",
      "Priority-based compute budgeting",
      "Execution slot management",
      "Quota preview",
      "Resource rebalancing",
      "Capacity forecasting",
      "Runtime event emission",
      "Sovereign infrastructure governance",
    ],
  };
}

export function allocateRuntimeResources(input?: {
  target?: string;
  priority?: ResourcePriority;
  cpuUnits?: number;
  memoryUnits?: number;
  executionSlots?: number;
}) {
  const priority = input?.priority || "high";

  const requested = {
    cpuUnits: input?.cpuUnits ?? (priority === "critical" ? 30 : 15),
    memoryUnits: input?.memoryUnits ?? (priority === "critical" ? 30 : 15),
    executionSlots: input?.executionSlots ?? (priority === "critical" ? 5 : 2),
  };

  const pool =
    resourcePools.find(
      (item) =>
        item.cpuUnits >= requested.cpuUnits &&
        item.memoryUnits >= requested.memoryUnits &&
        item.executionSlots >= requested.executionSlots,
    ) || resourcePools[0];

  if (
    pool.cpuUnits < requested.cpuUnits ||
    pool.memoryUnits < requested.memoryUnits ||
    pool.executionSlots < requested.executionSlots
  ) {
    pool.status = "constrained";

    return {
      ok: false,
      version: SOVEREIGN_RESOURCE_ALLOCATION_VERSION,
      reason: "INSUFFICIENT_RESOURCE_CAPACITY",
      pool,
      requested,
    };
  }

  pool.cpuUnits -= requested.cpuUnits;
  pool.memoryUnits -= requested.memoryUnits;
  pool.executionSlots -= requested.executionSlots;
  pool.status =
    pool.cpuUnits < 20 || pool.memoryUnits < 20 || pool.executionSlots < 3
      ? "constrained"
      : "allocated";

  const allocation: ResourceAllocation = {
    allocationId: `resource_allocation_${Date.now()}`,
    target: input?.target || "sovereign-runtime",
    priority,
    ...requested,
    createdAt: new Date().toISOString(),
  };

  allocations.push(allocation);

  emitRuntimeEvent({
    type: "RuntimeResourcesAllocated",
    source: "resource-allocation",
    target: allocation.target,
    priority,
    payload: {
      allocationId: allocation.allocationId,
      poolId: pool.poolId,
      requested,
    },
  });

  return {
    ok: true,
    version: SOVEREIGN_RESOURCE_ALLOCATION_VERSION,
    allocation,
    pool,
  };
}

export function rebalanceRuntimeResources() {
  for (const pool of resourcePools) {
    if (pool.cpuUnits < 15 || pool.memoryUnits < 15 || pool.executionSlots < 2) {
      pool.status = "overloaded";
    } else if (
      pool.cpuUnits < 30 ||
      pool.memoryUnits < 30 ||
      pool.executionSlots < 5
    ) {
      pool.status = "constrained";
    } else {
      pool.status = allocations.length > 0 ? "allocated" : "available";
    }
  }

  const overloadedPools = resourcePools.filter(
    (pool) => pool.status === "overloaded",
  );

  emitRuntimeEvent({
    type: "RuntimeResourcesRebalanced",
    source: "resource-allocation",
    priority: overloadedPools.length > 0 ? "critical" : "high",
    payload: {
      overloadedPools: overloadedPools.length,
      totalPools: resourcePools.length,
    },
  });

  return {
    ok: true,
    version: SOVEREIGN_RESOURCE_ALLOCATION_VERSION,
    pools: resourcePools,
    overloadedPools: overloadedPools.length,
  };
}

export function evaluateResourceQuota(input?: {
  target?: string;
  requestedCpu?: number;
  requestedMemory?: number;
  requestedSlots?: number;
}) {
  const requestedCpu = input?.requestedCpu ?? 10;
  const requestedMemory = input?.requestedMemory ?? 10;
  const requestedSlots = input?.requestedSlots ?? 1;

  const totalAvailable = resourcePools.reduce(
    (summary, pool) => ({
      cpuUnits: summary.cpuUnits + pool.cpuUnits,
      memoryUnits: summary.memoryUnits + pool.memoryUnits,
      executionSlots: summary.executionSlots + pool.executionSlots,
    }),
    { cpuUnits: 0, memoryUnits: 0, executionSlots: 0 },
  );

  const approved =
    totalAvailable.cpuUnits >= requestedCpu &&
    totalAvailable.memoryUnits >= requestedMemory &&
    totalAvailable.executionSlots >= requestedSlots;

  return {
    ok: true,
    version: SOVEREIGN_RESOURCE_ALLOCATION_VERSION,
    target: input?.target || "sovereign-runtime",
    approved,
    requested: {
      cpuUnits: requestedCpu,
      memoryUnits: requestedMemory,
      executionSlots: requestedSlots,
    },
    available: totalAvailable,
  };
}

export function forecastResourceCapacity() {
  const total = resourcePools.reduce(
    (summary, pool) => ({
      cpuUnits: summary.cpuUnits + pool.cpuUnits,
      memoryUnits: summary.memoryUnits + pool.memoryUnits,
      executionSlots: summary.executionSlots + pool.executionSlots,
    }),
    { cpuUnits: 0, memoryUnits: 0, executionSlots: 0 },
  );

  const pressure =
    total.cpuUnits < 60 || total.memoryUnits < 60 || total.executionSlots < 10
      ? "high"
      : total.cpuUnits < 120 || total.memoryUnits < 120 || total.executionSlots < 20
        ? "moderate"
        : "healthy";

  emitRuntimeEvent({
    type: "RuntimeResourceCapacityForecasted",
    source: "resource-allocation",
    priority: pressure === "high" ? "critical" : "normal",
    payload: {
      pressure,
      total,
      allocationCount: allocations.length,
    },
  });

  return {
    ok: true,
    version: SOVEREIGN_RESOURCE_ALLOCATION_VERSION,
    pressure,
    totalAvailable: total,
    allocationCount: allocations.length,
    recommendation:
      pressure === "high"
        ? "Throttle non-critical work and reserve capacity for recovery."
        : pressure === "moderate"
          ? "Monitor resource usage and rebalance execution queues."
          : "Capacity is healthy for continued autonomous operations.",
  };
}
