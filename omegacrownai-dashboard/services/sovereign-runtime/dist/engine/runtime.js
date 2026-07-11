import fs from "fs";
import path from "path";
import { runAgentChain } from "../agents/chain.js";
import { buildArtifacts } from "../artifacts/builder.js";
import { validateGeneratedArtifacts } from "../artifacts/generated-artifact-validator.js";
import { validateRun } from "../validation/validator.js";
import { prepareDelivery } from "../delivery/delivery.js";
import { appendTranscript } from "../storage/transcript.js";
import { loadRun, saveRun, appendRunEvent } from "../storage/runs.js";
function id(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}
function normalizeArtifactPath(value) {
    return value.replace(/\\/g, "/").replace(/^.*\/data\/artifacts\/[^/]+\//, "");
}
function safeReadJson(file) {
    try {
        if (!fs.existsSync(file))
            return null;
        return JSON.parse(fs.readFileSync(file, "utf8"));
    }
    catch {
        return null;
    }
}
function writeDeliveryManifest(run) {
    const projectId = run.projectId;
    const cwd = process.cwd();
    const runtimeRoot = cwd.endsWith(path.join("services", "sovereign-runtime"))
        ? cwd
        : path.resolve(cwd, "services", "sovereign-runtime");
    const artifactDir = path.join(runtimeRoot, "data", "artifacts", projectId);
    const exportsDir = path.join(runtimeRoot, "data", "exports");
    const deploymentsDir = path.join(runtimeRoot, "data", "deployments");
    const deploymentPath = path.join(deploymentsDir, `${projectId}.json`);
    const exportPath = path.join(exportsDir, `${projectId}.json`);
    fs.mkdirSync(exportsDir, { recursive: true });
    fs.mkdirSync(deploymentsDir, { recursive: true });
    const deploymentRecord = safeReadJson(deploymentPath) || {
        ok: true,
        projectId,
        runtimeId: run.runtimeId,
        status: "deployed",
        artifactDir,
        previewUrl: `/deployed/${projectId}`,
        runtimePreviewUrl: `/runtime-preview/${projectId}`,
        downloadUrl: `/api/runtime-proxy/runs/${projectId}/download`,
        validationUrl: `/api/sovereign/runs/${projectId}/validate`,
        deployedAt: new Date().toISOString(),
    };
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentRecord, null, 2));
    const metadata = safeReadJson(path.join(artifactDir, "metadata.json"));
    const validation = run.generatedArtifactValidation || run.validation?.generatedArtifacts || null;
    const files = fs.existsSync(artifactDir)
        ? fs.readdirSync(artifactDir, { recursive: true })
            .map((file) => normalizeArtifactPath(String(file)))
            .filter((file) => file.length > 0)
            .sort()
        : [];
    const manifest = {
        ok: true,
        projectId,
        runtimeId: run.runtimeId,
        status: "delivered",
        mode: metadata?.mode || run.mode || "general",
        product: metadata?.product || metadata?.name || "Generated Artifact",
        artifactDir,
        deploymentRecordPath: fs.existsSync(deploymentPath) ? deploymentPath : null,
        deploymentRecord,
        previewUrl: deploymentRecord?.previewUrl || `/deployed/${projectId}`,
        runtimePreviewUrl: `/runtime-preview/${projectId}`,
        downloadUrl: `/api/runtime-proxy/runs/${projectId}/download`,
        artifactHistoryUrl: `/artifacts/${projectId}`,
        validationUrl: `/projects/${projectId}/validation`,
        files,
        fileCount: files.length,
        validation,
        delivery: run.delivery || null,
        generatedArtifactQualityReport: metadata?.generatedArtifactQualityReport || null,
        deliveredAt: new Date().toISOString(),
    };
    fs.writeFileSync(exportPath, JSON.stringify(manifest, null, 2));
    return manifest;
}
export async function createRun(input) {
    const projectId = input.projectId || id("OC");
    const runtimeId = input.runtimeId || id("RT");
    const now = new Date().toISOString();
    const run = {
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
export async function getRun(projectId) {
    return loadRun(projectId);
}
export async function executeRun(projectId, input) {
    const run = loadRun(projectId);
    if (!run) {
        return { ok: false, error: "Run not found", projectId };
    }
    try {
        run.status = "running";
        const buildSpec = createBuildSpec({ prompt: run.prompt, mode: run.mode, projectId: run.projectId });
        run.buildSpec = buildSpec;
        run.originalPrompt = buildSpec.originalPrompt;
        run.normalizedPrompt = buildSpec.normalizedPrompt;
        appendRunEvent(run, buildSpec.isIncomplete ? "Prompt normalized with smart defaults" : "Prompt normalized into build spec");
        appendTranscript(projectId, buildSpec.isIncomplete ? `Prompt was incomplete. Smart defaults applied: ${buildSpec.missingFields.join(", ")}` : "Prompt normalized into full build spec.");
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
        run.generatedArtifactValidation = generatedArtifactValidation;
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
        const deliveryManifest = writeDeliveryManifest(run);
        run.deliveryManifest = deliveryManifest;
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
    }
    catch (error) {
        run.status = "error";
        run.error = String(error);
        appendRunEvent(run, `Execution error: ${String(error)}`);
        appendTranscript(projectId, `Execution error: ${String(error)}`);
        return saveRun(run);
    }
}
