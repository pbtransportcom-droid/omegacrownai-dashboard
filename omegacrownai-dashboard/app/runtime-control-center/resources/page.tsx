"use client";

import { useEffect, useState } from "react";

type ResourcePool = {
  poolId: string;
  name: string;
  cpuUnits: number;
  memoryUnits: number;
  executionSlots: number;
  status: string;
};

type ResourceState = {
  version: string;
  pools: ResourcePool[];
  allocations: unknown[];
};

export default function ResourceControlCenterPage() {
  const [data, setData] = useState<ResourceState | null>(null);

  async function loadData() {
    try {
      const response = await fetch("/api/resource-allocation/status");
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-5xl font-bold">
            Sovereign Resource Intelligence
          </h1>

          <p className="text-zinc-400 mt-4 text-lg">
            Autonomous infrastructure allocation, runtime balancing,
            execution pressure monitoring, and sovereign compute governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data?.pools?.map((pool) => (
            <div
              key={pool.poolId}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  {pool.name}
                </h2>

                <div
                  className={`text-sm px-3 py-1 rounded-full ${
                    pool.status === "available"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : pool.status === "allocated"
                        ? "bg-blue-500/20 text-blue-400"
                        : pool.status === "constrained"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {pool.status}
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div>
                  <div className="text-zinc-500 text-sm">
                    CPU Units
                  </div>

                  <div className="mt-2 w-full bg-zinc-800 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{
                        width: `${pool.cpuUnits}%`,
                      }}
                    />
                  </div>

                  <div className="text-sm text-zinc-400 mt-2">
                    {pool.cpuUnits} remaining
                  </div>
                </div>

                <div>
                  <div className="text-zinc-500 text-sm">
                    Memory Units
                  </div>

                  <div className="mt-2 w-full bg-zinc-800 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full"
                      style={{
                        width: `${pool.memoryUnits}%`,
                      }}
                    />
                  </div>

                  <div className="text-sm text-zinc-400 mt-2">
                    {pool.memoryUnits} remaining
                  </div>
                </div>

                <div>
                  <div className="text-zinc-500 text-sm">
                    Execution Slots
                  </div>

                  <div className="mt-2 w-full bg-zinc-800 rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full"
                      style={{
                        width: `${pool.executionSlots * 5}%`,
                      }}
                    />
                  </div>

                  <div className="text-sm text-zinc-400 mt-2">
                    {pool.executionSlots} available
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-semibold">
                Runtime Allocation Overview
              </h2>

              <p className="text-zinc-400 mt-2">
                Active sovereign infrastructure allocation telemetry.
              </p>
            </div>

            <div className="text-right">
              <div className="text-zinc-500 text-sm">
                Active Allocations
              </div>

              <div className="text-4xl font-bold text-blue-400 mt-2">
                {data?.allocations?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
