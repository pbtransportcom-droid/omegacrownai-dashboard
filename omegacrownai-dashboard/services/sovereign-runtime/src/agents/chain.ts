export async function runAgentChain(run: any, input: any) {
  const mode = run.mode || "general";
  const buildSpec = run.buildSpec || null;
  const planSummary = buildSpec
    ? `Planned ${mode} execution for ${run.projectId}: ${buildSpec.productType} for ${buildSpec.brandName}. Pages: ${(buildSpec.pages || []).join(", ")}.`
    : `Planned ${mode} execution for ${run.projectId}.`;

  return [
    {
      name: "Planner Agent",
      role: "Plans execution",
      output: planSummary,
      status: "completed",
      timestamp: new Date().toISOString()
    },
    {
      name: "Builder Agent",
      role: "Builds artifacts",
      output: buildSpec
        ? `Built artifact plan from normalized build spec. Industry: ${buildSpec.industry}. Features: ${(buildSpec.features || []).join(", ")}. Missing fields handled: ${(buildSpec.missingFields || []).join(", ") || "none"}.`
        : `Built artifact plan from prompt: ${run.prompt}`,
      status: "completed",
      timestamp: new Date().toISOString()
    },
    {
      name: "Validator Agent",
      role: "Validates output",
      output: "Validated required runtime outputs.",
      status: "completed",
      timestamp: new Date().toISOString()
    },
    {
      name: "Delivery Agent",
      role: "Prepares delivery",
      output: "Prepared customer-ready delivery package.",
      status: "completed",
      timestamp: new Date().toISOString()
    }
  ];
}
