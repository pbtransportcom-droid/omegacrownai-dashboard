import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    const artifactDir = path.join(process.cwd(), "data", "generated-artifacts", projectId);

    if (!fs.existsSync(artifactDir)) {
      return NextResponse.json({ ok: false, error: "Artifact not found." }, { status: 404 });
    }

    const exportDir = path.join(process.cwd(), "data", "exports");
    fs.mkdirSync(exportDir, { recursive: true });

    const zipPath = path.join(exportDir, `${projectId}.zip`);

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archiver = require("archiver");
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => resolve());
      archive.on("error", (err: Error) => reject(err));

      archive.pipe(output);
      archive.directory(artifactDir, false);
      archive.finalize();
    });

    return NextResponse.json({
      ok: true,
      projectId,
      export: `/api/sovereign/download/${projectId}`,
      zipPath,
      size: fs.statSync(zipPath).size,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to generate deployment package." },
      { status: 500 }
    );
  }
}
