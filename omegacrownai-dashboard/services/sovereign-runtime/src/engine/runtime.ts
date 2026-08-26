import fs from "fs";
import path from "path";
import { runAgentChain } from "../agents/chain.js";
import { buildArtifacts } from "../artifacts/builder.js";
import { validateGeneratedArtifacts } from "../artifacts/generated-artifact-validator.js";
import { applyBlueprintCompliance } from "../artifacts/blueprint-compliance-engine.js";
import { evaluateBehavioralCompliance } from "../artifacts/behavioral-compliance.js";
import { validateRun } from "../validation/validator.js";
import { prepareDelivery } from "../delivery/delivery.js";
import { appendTranscript } from "../storage/transcript.js";
import { loadRun, saveRun, appendRunEvent } from "../storage/runs.js";
import type { RuntimeRun } from "./schema.js";
import { runtimeDataPath } from "../storage/runtime-paths.js";
import { createBuildSpec } from "../intelligence/build-spec.js";

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function normalizeArtifactPath(value: string) {
  return value.replace(/\\/g, "/").replace(/^.*\/data\/artifacts\/[^/]+\//, "");
}

function safeReadJson(file: string): any | null {
  try {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function writeDeliveryManifest(run: RuntimeRun) {
  const projectId = run.projectId;
  // CANONICAL_RUNTIME_DATA_PATH
  // RUNTIME_CWD_REPAIR
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

  const deploymentRecord =
    safeReadJson(deploymentPath) || {
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
  const validation = (run as any).generatedArtifactValidation || run.validation?.generatedArtifacts || null;

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
    productId: input.productId || undefined,
    productName: input.productName || undefined,
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
    const buildSpec = createBuildSpec({
      prompt: run.prompt,
      mode: run.mode,
      projectId: run.projectId,
      productId: run.productId,
      productName: run.productName,
    });
    (run as any).buildSpec = buildSpec;
    (run as any).originalPrompt = buildSpec.originalPrompt;
    (run as any).normalizedPrompt = buildSpec.normalizedPrompt;
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

    const generatedArtifacts = await buildArtifacts(run);

    const blueprintCompliance =
      applyBlueprintCompliance(
        run,
        generatedArtifacts
      );

    run.artifacts = blueprintCompliance.artifacts;
    (run as any).blueprintCompliance =
      blueprintCompliance.report;

    // BEHAVIORAL_BLUEPRINT_COMPLIANCE_GATE
    // BEHAVIORAL_FINAL_GENERATED_INDUSTRY_CONTRACT
    //
    // Behavioral compliance must use the final semantic domain emitted by
    // the Living OS pipeline. RuntimeArtifact intentionally has a narrow
    // public type, so inspect the richer generated-artifact shape only at
    // this local runtime boundary.
    const behavioralIndustry = (() => {
      const semanticArtifact =
        run.artifacts.find(
          (artifact) =>
            path.basename(
              String(
                artifact.path || ""
              )
            ) ===
            "living-os-traceability.json"
        ) ||
        run.artifacts.find(
          (artifact) =>
            path.basename(
              String(
                artifact.path || ""
              )
            ) ===
            "living-os-plan.json"
        );

      if (semanticArtifact) {
        try {
          const artifactRecord =
            semanticArtifact as any;

          let rawSemanticArtifact =
            artifactRecord.content;

          const artifactPath =
            String(
              artifactRecord.path || ""
            ).trim();

          if (
            (
              rawSemanticArtifact === undefined ||
              rawSemanticArtifact === null ||
              rawSemanticArtifact === ""
            ) &&
            artifactPath &&
            fs.existsSync(artifactPath)
          ) {
            rawSemanticArtifact =
              fs.readFileSync(
                artifactPath,
                "utf8"
              );
          }

          const parsed =
            typeof rawSemanticArtifact === "string"
              ? JSON.parse(
                  rawSemanticArtifact
                )
              : rawSemanticArtifact;

          const finalIndustry =
            String(
              parsed?.industry || ""
            ).trim();

          if (finalIndustry) {
            return finalIndustry;
          }
        } catch {
          // Preserve runtime execution. The original pre-render
          // classification remains the safe fallback.
        }
      }

      return buildSpec.industry;
    })();

    const behavioralCompliance =
      evaluateBehavioralCompliance(
        behavioralIndustry,
        run.artifacts
      );

    (run as any).behavioralCompliance =
      behavioralCompliance;

    // BEHAVIORAL_COMPLIANCE_ARTIFACT
    const behavioralCompliancePath =
      path.join(
        process.cwd(),
        "data",
        "artifacts",
        projectId,
        "behavioral-compliance.json"
      );

    fs.writeFileSync(
      behavioralCompliancePath,
      JSON.stringify(
        behavioralCompliance,
        null,
        2
      )
    );

    run.artifacts.push({
      file: "behavioral-compliance.json",
      path: behavioralCompliancePath,
      title: "Behavioral Compliance Report",
      type: "json",
      content: JSON.stringify(
        behavioralCompliance,
        null,
        2
      ),
      status: "ready",
    } as any);

    appendRunEvent(
      run,
      behavioralCompliance.deliveryBlocked
        ? `Behavioral compliance blocked at ${behavioralCompliance.score}/100`
        : `Behavioral compliance passed at ${behavioralCompliance.score}/100`
    );

    appendTranscript(
      projectId,
      behavioralCompliance.deliveryBlocked
        ? `Behavioral compliance blocked delivery. Missing behavior: ${behavioralCompliance.failedRequirements.join(", ") || "unknown"}.`
        : "Behavioral compliance passed."
    );

    appendRunEvent(
      run,
      blueprintCompliance.report.deliveryBlocked
        ? `Blueprint compliance blocked at ${blueprintCompliance.report.score}/${blueprintCompliance.report.minimumQualityScore}`
        : `Blueprint compliance passed at ${blueprintCompliance.report.score}/${blueprintCompliance.report.minimumQualityScore}`
    );

    appendTranscript(
      projectId,
      blueprintCompliance.report.deliveryBlocked
        ? `Authoritative blueprint compliance blocked delivery. Missing pages: ${blueprintCompliance.report.missingPages.join(", ") || "none"}. Missing APIs: ${blueprintCompliance.report.missingApiRoutes.join(", ") || "none"}. Missing features: ${blueprintCompliance.report.missingFeatures.join(", ") || "none"}.`
        : "Authoritative blueprint compliance passed."
    );

    appendRunEvent(run, "Artifacts generated");
    appendTranscript(projectId, "Artifacts generated");

    // SHARED_GENERATED_README_FINALIZER
    //
    // Every standalone generated application must contain a README.
    // Preserve renderer-authored READMEs and synthesize one only when
    // the final generated artifact package does not already provide it.
    const hasGeneratedReadme =
      run.artifacts.some((artifact: any) => {
        const artifactPath =
          String(
            artifact?.file ||
            artifact?.path ||
            ""
          )
            .replace(/\\/g, "/")
            .trim();

        return (
          artifactPath === "README.md" ||
          artifactPath.endsWith("/README.md")
        );
      });

    if (!hasGeneratedReadme) {
      const semanticArtifact =
        run.artifacts.find((artifact: any) => {
          const artifactPath =
            String(
              artifact?.file ||
              artifact?.path ||
              ""
            )
              .replace(/\\/g, "/")
              .trim();

          return (
            artifactPath ===
              "living-os-traceability.json" ||
            artifactPath.endsWith(
              "/living-os-traceability.json"
            ) ||
            artifactPath ===
              "living-os-plan.json" ||
            artifactPath.endsWith(
              "/living-os-plan.json"
            )
          );
        });

      let semanticMetadata: any = null;

      if (semanticArtifact) {
        try {
          const semanticRecord =
            semanticArtifact as any;

          let rawSemantic =
            semanticRecord.content;

          const semanticPath =
            String(
              semanticRecord.path || ""
            ).trim();

          if (
            (
              rawSemantic === undefined ||
              rawSemantic === null ||
              rawSemantic === ""
            ) &&
            semanticPath &&
            fs.existsSync(semanticPath)
          ) {
            rawSemantic =
              fs.readFileSync(
                semanticPath,
                "utf8"
              );
          }

          semanticMetadata =
            typeof rawSemantic === "string"
              ? JSON.parse(rawSemantic)
              : rawSemantic;
        } catch {
          semanticMetadata = null;
        }
      }

      const generatedIndustry =
        String(
          semanticMetadata?.industry ||
          buildSpec.industry ||
          run.mode ||
          "application"
        )
          .trim()
          .toLowerCase();

      const generatedProduct =
        String(
          semanticMetadata?.product ||
          semanticMetadata?.name ||
          buildSpec.productType ||
          "Generated Application"
        ).trim();

      const readmeContent = `# ${generatedProduct}

## Overview

This package contains a production-oriented ${generatedIndustry} application generated from the approved project requirements.

## Included application package

- Next.js application source
- Application routes and user workflows
- Administrative experience where required
- API routes and server-side functionality
- Persistence and data models where required
- Generated visual and application assets
- Delivery documentation
- Launch checklist

## Development

Install dependencies:

\`\`\`bash
npm install
\`\`\`

Run the development server:

\`\`\`bash
npm run dev
\`\`\`

If the package uses Prisma, generate the Prisma client before starting the application:

\`\`\`bash
npm run db:generate
\`\`\`

## Production

Review \`DELIVERY.md\` and \`LAUNCH_CHECKLIST.md\` before production deployment.

Configure the environment variables and external providers required by this generated application before launch.

## Ownership

- Organization: Princess Benjamin Transportation Company
- Technical package author: Princess Benjamin Transportation Company
- Generated by: OmegaCrownAI
- Copyright: © 2026 Princess Benjamin Transportation Company
`;

      const runtimeRoot =
        process.cwd().endsWith(
          path.join(
            "services",
            "sovereign-runtime"
          )
        )
          ? process.cwd()
          : path.resolve(
              process.cwd(),
              "services",
              "sovereign-runtime"
            );

      const readmePath =
        path.join(
          runtimeRoot,
          "data",
          "artifacts",
          projectId,
          "README.md"
        );

      fs.mkdirSync(
        path.dirname(readmePath),
        {
          recursive: true,
        }
      );

      fs.writeFileSync(
        readmePath,
        readmeContent
      );

      run.artifacts.push({
        file: "README.md",
        path: readmePath,
        title: `${generatedProduct} README`,
        type: "markdown",
        content: readmeContent,
        status: "ready",
      } as any);

      appendRunEvent(
        run,
        "Generated package README finalized"
      );

      appendTranscript(
        projectId,
        "Generated package README finalized."
      );
    }

    const baseGeneratedArtifactValidation =
      validateGeneratedArtifacts(run.artifacts);

    // COMBINED_BLUEPRINT_BEHAVIORAL_VALIDATION_GATE
    const complianceBlocked =
      blueprintCompliance.report.deliveryBlocked ||
      behavioralCompliance.deliveryBlocked;

    const complianceErrors = [
      ...(blueprintCompliance.report.deliveryBlocked
        ? [
            {
              level: "error" as const,
              file: "blueprint-compliance.json",
              message:
                `Authoritative blueprint compliance blocked delivery with score ${blueprintCompliance.report.score}/${blueprintCompliance.report.minimumQualityScore}.`,
            },
          ]
        : []),
      ...(behavioralCompliance.deliveryBlocked
        ? [
            {
              level: "error" as const,
              file: "behavioral-compliance.json",
              message:
                `Behavioral compliance blocked delivery with score ${behavioralCompliance.score}/100. Missing behavior: ${behavioralCompliance.failedRequirements.join(", ") || "unknown"}.`,
            },
          ]
        : []),
    ];

    const generatedArtifactValidation =
      complianceBlocked
        ? {
            ...baseGeneratedArtifactValidation,
            ok: false,
            errors: [
              ...baseGeneratedArtifactValidation.errors,
              ...complianceErrors,
            ],
            summary:
              `Generated artifact validation blocked by compliance. Blueprint: ${blueprintCompliance.report.score}/${blueprintCompliance.report.minimumQualityScore}. Behavioral: ${behavioralCompliance.score}/100.`,
          }
        : baseGeneratedArtifactValidation;

    (run as any).generatedArtifactValidation =
      generatedArtifactValidation;

    if (!generatedArtifactValidation.ok) {
      run.validation = {
        status: "blocked",
        generatedArtifacts: generatedArtifactValidation,
      };

      run.delivery = {
        status: "blocked",
        reason:
          generatedArtifactValidation.summary,
      };

      run.summary = {
        agents: run.agents.length,
        artifacts: run.artifacts.length,
        validation: "blocked",
        delivery: "blocked",
      };

      run.status = "blocked";
      run.error =
        generatedArtifactValidation.summary;

      appendRunEvent(
        run,
        "Generated artifact validation blocked delivery"
      );

      appendTranscript(
        projectId,
        generatedArtifactValidation.summary
      );

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
    (run as any).deliveryManifest = deliveryManifest;

    appendRunEvent(run, "Delivery prepared");
    appendTranscript(projectId, "Delivery prepared");

    run.summary = {
      agents: run.agents.length,
      artifacts: run.artifacts.length,
      validation: run.validation?.status || "unknown",
      delivery: run.delivery?.status || "unknown"
    };

    // SUCCESSFUL_RUN_ERROR_NORMALIZATION
    // A run that reaches the canonical completed state must not retain
    // an obsolete validation/compliance error from an earlier gate.
    run.error = undefined;
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
