import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const zipPath = path.join(process.cwd(), "data", "exports", `${projectId}.zip`);

  if (!fs.existsSync(zipPath)) {
    return new Response("Export package not found. Generate export first.", {
      status: 404,
    });
  }

  const file = fs.readFileSync(zipPath);

  return new Response(file, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${projectId}-omegacrownai-export.zip"`,
      "Content-Length": String(file.length),
    },
  });
}
