import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    const artifactDir = path.join(
      process.cwd(),
      "data",
      "generated-artifacts",
      projectId
    );

    if (!fs.existsSync(artifactDir)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Artifact not found.",
        },
        { status: 404 }
      );
    }

    const exportDir = path.join(
      process.cwd(),
      "data",
      "exports"
    );

    fs.mkdirSync(exportDir, { recursive: true });

    const zipPath = path.join(
      exportDir,
      `${projectId}.zip`
    );

    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    execSync(
      `cd "${artifactDir}" && zip -r "${zipPath}" .`,
      { stdio: "ignore" }
    );

    return NextResponse.json({
      ok: true,
      projectId,
      export: `/api/sovereign/download/${projectId}`,
      zipPath,
      size: fs.statSync(zipPath).size,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
