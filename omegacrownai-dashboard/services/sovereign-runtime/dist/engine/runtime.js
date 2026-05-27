import fs from "fs";
import path from "path";
import { runAgentChain } from "../agents/chain.js";
import { buildArtifacts } from "../artifacts/builder.js";
import { validateRun } from "../validation/validator.js";
import { prepareDelivery } from "../delivery/delivery.js";
const root = process.cwd();
const dataRoot = path.join(root, "data");
const runsDir = path.join(dataRoot, "runs");
fs.mkdirSync(runsDir, { recursive: true });
function id(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}
function runPath(projectId) {
    return path.join(runsDir, `${projectId}.json`);
}
export async function createRun(input) {
    const projectId = input.projectId || id("OC");
    const runtimeId = input.runtimeId || id("RT");
    const run = {
        ok: true,
        projectId,
        runtimeId,
        mode: input.mode || input.intent || "general",
        prompt: input.prompt || "",
        status: "created",
        createdAt: new Date().toISOString(),
        events: ["Run created"],
        agents: [],
        artifacts: [],
        validation: null,
        delivery: null
    };
    fs.writeFileSync(runPath(projectId), JSON.stringify(run, null, 2));
    return run;
}
export async function getRun(projectId) {
    const file = runPath(projectId);
    if (!fs.existsSync(file))
        return null;
    return JSON.parse(fs.readFileSync(file, "utf8"));
}
export async function executeRun(projectId, input) {
    const existing = await getRun(projectId);
    if (!existing)
        return { ok: false, error: "Run not found", projectId };
    existing.status = "running";
    existing.events.push("Execution started");
    const agents = await runAgentChain(existing, input);
    existing.agents = agents;
    existing.events.push("Agent chain completed");
    const artifacts = await buildArtifacts(existing);
    existing.artifacts = artifacts;
    existing.events.push("Artifacts generated");
    const validation = await validateRun(existing);
    existing.validation = validation;
    existing.events.push("Validation completed");
    const delivery = await prepareDelivery(existing);
    existing.delivery = delivery;
    existing.events.push("Delivery prepared");
    existing.status = "completed";
    existing.completedAt = new Date().toISOString();
    fs.writeFileSync(runPath(projectId), JSON.stringify(existing, null, 2));
    return {
        ok: true,
        projectId,
        status: existing.status,
        agents,
        artifacts,
        validation,
        delivery
    };
}
