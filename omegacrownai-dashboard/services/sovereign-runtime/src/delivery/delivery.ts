import fs from "fs";
import path from "path";

export async function prepareDelivery(run: any) {
  const exportDir = path.join(process.cwd(), "data", "exports");
  fs.mkdirSync(exportDir, { recursive: true });

  const manifestPath = path.join(exportDir, `${run.projectId}.json`);

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
    download: `/exports/${run.projectId}.json`
  };
}
