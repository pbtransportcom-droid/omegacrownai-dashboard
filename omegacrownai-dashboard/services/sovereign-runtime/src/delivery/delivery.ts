import fs from "fs";
import path from "path";

export async function prepareDelivery(run: any) {
  const exportDir = path.join(process.cwd(), "data", "exports");
  fs.mkdirSync(exportDir, { recursive: true });

  const manifestPath = path.join(exportDir, `${run.projectId}.json`);

  const buildProof = {
    generatedArtifactValidation: (run as any).generatedArtifactValidation || run.validation?.generatedArtifacts || null,
    standaloneBuildReady: Boolean(((run as any).generatedArtifactValidation || run.validation?.generatedArtifacts)?.ok),
    requiredFiles: [
      "package.json",
      "global.d.ts",
      "prisma/schema.prisma",
      "app/layout.tsx",
      "app/page.tsx",
      "app/customer/page.tsx",
      "app/admin/bookings/page.tsx",
      "README.md"
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
        createdAt: new Date().toISOString()
      },
      null,
      2
    )
  );

  return {
    status: "ready",
    manifestPath,
    download: `/exports/${run.projectId}.json`,
    buildProof
  };
}
