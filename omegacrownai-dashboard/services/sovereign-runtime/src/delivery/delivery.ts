import fs from "fs";
import path from "path";
import { runtimeDataPath } from "../storage/runtime-paths.js";

export async function prepareDelivery(run: any) {
  const blueprintCompliance =
    (run as any).blueprintCompliance || null;

  const behavioralCompliance =
    (run as any).behavioralCompliance || null;

  const generatedArtifactValidation =
    (run as any).generatedArtifactValidation ||
    run.validation?.generatedArtifacts ||
    null;

  const deliveryBlocked =
    Boolean(blueprintCompliance?.deliveryBlocked) ||
    Boolean(behavioralCompliance?.deliveryBlocked) ||
    generatedArtifactValidation?.ok === false;

  const exportDir =
    runtimeDataPath(
      "exports"
    );
  fs.mkdirSync(exportDir, { recursive: true });

  const manifestPath = path.join(exportDir, `${run.projectId}.json`);

  const buildProof = {
    blueprintCompliance,
    behavioralCompliance,
    generatedArtifactValidation,
    standaloneBuildReady:
      !deliveryBlocked &&
      Boolean(generatedArtifactValidation?.ok),
    requiredFiles: [
      "package.json",
      "global.d.ts",
      "prisma/schema.prisma",
      "app/layout.tsx",
      "app/page.tsx",
      "app/admin/page.tsx",
      "app/api/intake/route.ts",
      "lib/intake-store.ts",
      "README.md",
      "DELIVERY.md",
      "LAUNCH_CHECKLIST.md"
    ]
  };

  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        projectId: run.projectId,
        mode: run.mode,
        artifacts: run.artifacts,
        validation: run.validation,
        blueprintCompliance,
        deliveryBlocked,
        createdAt: new Date().toISOString()
      },
      null,
      2
    )
  );

  return {
    status: deliveryBlocked ? "blocked" : "ready",
    manifestPath,
    download: deliveryBlocked
      ? null
      : `/exports/${run.projectId}.json`,
    buildProof,
    blockedReason: deliveryBlocked
      ? "Authoritative blueprint or generated artifact validation failed."
      : null
  };
}
