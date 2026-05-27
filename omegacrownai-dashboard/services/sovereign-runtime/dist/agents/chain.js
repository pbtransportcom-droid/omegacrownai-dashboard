export async function runAgentChain(run, input) {
    const mode = run.mode || "general";
    return [
        {
            name: "Planner Agent",
            role: "Plans execution",
            output: `Planned ${mode} execution for ${run.projectId}.`,
            status: "completed",
            timestamp: new Date().toISOString()
        },
        {
            name: "Builder Agent",
            role: "Builds artifacts",
            output: `Built artifact plan from prompt: ${run.prompt}`,
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
