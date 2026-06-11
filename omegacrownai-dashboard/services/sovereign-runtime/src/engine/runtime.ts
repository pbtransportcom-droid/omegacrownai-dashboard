import { runAgentChain } from "../agents/chain.js";
import { buildArtifacts } from "../artifacts/builder.js";
import { validateGeneratedArtifacts } from "../artifacts/generated-artifact-validator.js";
import { validateRun } from "../validation/validator.js";
import { prepareDelivery } from "../delivery/delivery.js";
import { appendTranscript } from "../storage/transcript.js";
import { loadRun, saveRun, appendRunEvent } from "../storage/runs.js";
import type { RuntimeRun } from "./schema.js";

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export async function createRun(input: any) {
  const projectId = input.projectId || id("OC");
  const runtimeId = input.runtimeId || id("RT");
  const now = new Date().toISOString();

  const run: RuntimeRun = {
    ok: true,
    projectId,
    runtimeId,
    mode: input.mode || input.intent || "general",
    prompt: input.prompt || "",
    status: "created",
    createdAt: now,
    updatedAt: now,
    events: ["Run created"],
    agents: [],
    artifacts: [],
    validation: null,
    delivery: null,
    summary: null
  };

  return saveRun(run);
}

export async function getRun(projectId: string) {
  return loadRun(projectId);
}

export async function executeRun(projectId: string, input: any) {
  const run = loadRun(projectId);

  if (!run) {
    return { ok: false, error: "Run not found", projectId };
  }

  try {
    run.status = "running";
    appendRunEvent(run, "Execution started");
    appendTranscript(projectId, "Execution started");

    run.status = "agent_chain";
    saveRun(run);

    const agents = await runAgentChain(run, input);
    run.agents = agents;
    appendRunEvent(run, "Agent chain completed");
    appendTranscript(projectId, "Agent chain completed");

    run.status = "artifacts";
    saveRun(run);

    const artifacts = await buildArtifacts(run);
    run.artifacts = artifacts;
    appendRunEvent(run, "Artifacts generated");
    appendTranscript(projectId, "Artifacts generated");

    const generatedArtifactValidation = validateGeneratedArtifacts(artifacts);
    (run as any).generatedArtifactValidation = generatedArtifactValidation;

    if (!generatedArtifactValidation.ok) {
      run.validation = {
        generatedArtifacts: generatedArtifactValidation,
      };
      run.status = "validation";
      appendRunEvent(run, "Generated artifact validation failed");
      appendTranscript(projectId, generatedArtifactValidation.summary);
      await saveRun(run);
      return run;
    }

    appendRunEvent(run, "Generated artifact validation passed");
    appendTranscript(projectId, generatedArtifactValidation.summary);

    run.status = "validation";
    saveRun(run);

    const validation = await validateRun(run);
    run.validation = validation;
    appendRunEvent(run, "Validation completed");
    appendTranscript(projectId, "Validation completed");

    run.status = "delivery";
    saveRun(run);

    const delivery = await prepareDelivery(run);
    run.delivery = delivery;
    appendRunEvent(run, "Delivery prepared");
    appendTranscript(projectId, "Delivery prepared");

    run.summary = {
      agents: run.agents.length,
      artifacts: run.artifacts.length,
      validation: run.validation?.status || "unknown",
      delivery: run.delivery?.status || "unknown"
    };

    run.status = "completed";
    run.completedAt = new Date().toISOString();
    appendRunEvent(run, "Execution completed");
    appendTranscript(projectId, "Execution completed");

    return saveRun(run);
  } catch (error) {
    run.status = "error";
    run.error = String(error);
    appendRunEvent(run, `Execution error: ${String(error)}`);
    appendTranscript(projectId, `Execution error: ${String(error)}`);
    return saveRun(run);
  }
}
