export async function WebsiteDeployRunner(job: any) {
  return {
    ok: true,
    status: "website_deploy_prepared",
    url: `https://omegacrownai.com/site/${job.projectId}-${job.buildId || "draft"}`,
    note: "Local Sugent Cloud runner prepared website deployment.",
  };
}

export async function TradingBotRunner(job: any) {
  return {
    ok: true,
    status: "trading_strategy_prepared",
    note: "Local Sugent Cloud runner prepared trading strategy. Educational only; no live trading executed.",
    strategy: {
      symbol: job.payload?.symbol || "",
      signal: job.payload?.summary?.signal || "WATCH",
      confidence: job.payload?.summary?.confidence || 0,
    },
  };
}

export async function AutomationFlowRunner(job: any) {
  return {
    ok: true,
    status: "automation_flow_prepared",
    note: "Local Sugent Cloud runner prepared automation flow. Review required before live external actions.",
    flow: {
      name: job.payload?.name || "Automation Flow",
      trigger: job.payload?.trigger || "manual_start",
      nodes: Array.isArray(job.payload?.nodes) ? job.payload.nodes.length : 0,
    },
  };
}

export function runnerForType(type: string) {
  if (type === "deploy_website") return WebsiteDeployRunner;
  if (type === "run_strategy") return TradingBotRunner;
  if (type === "run_automation") return AutomationFlowRunner;

  return async function DefaultRunner(job: any) {
    return {
      ok: true,
      status: "custom_job_prepared",
      type: job.type,
    };
  };
}
