import fs from "fs";
import path from "path";
import JSZip from "jszip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function zipHeaders(projectId: string, length: number) {
  return {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${projectId}-artifacts.zip"`,
    "Content-Length": String(length),
    "Cache-Control": "private, no-store, max-age=0",
  };
}

function addDirectoryToZip(
  zip: JSZip,
  rootDir: string,
  currentDir: string = rootDir
) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = path
      .relative(rootDir, absolutePath)
      .replace(/\\/g, "/");

    if (
      relativePath === "node_modules" ||
      relativePath.startsWith("node_modules/") ||
      relativePath === ".next" ||
      relativePath.startsWith(".next/")
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      addDirectoryToZip(zip, rootDir, absolutePath);
      continue;
    }

    if (entry.isFile()) {
      zip.file(relativePath, fs.readFileSync(absolutePath));
    }
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    if (!/^OC-[A-Z0-9]+$/i.test(projectId)) {
      return Response.json(
        {
          ok: false,
          error: "Invalid project ID.",
        },
        { status: 400 }
      );
    }

    const root = process.cwd();

    const candidates = [
      path.join(
        root,
        "services",
        "sovereign-runtime",
        "data",
        "artifacts",
        projectId
      ),
      path.join(root, "data", "generated-artifacts", projectId),
    ];

    const artifactDir = candidates.find((candidate) =>
      fs.existsSync(candidate)
    );

    if (!artifactDir || !fs.statSync(artifactDir).isDirectory()) {
      return Response.json(
        {
          ok: false,
          error: "Artifact directory not found.",
          projectId,
        },
        { status: 404 }
      );
    }

    const zip = new JSZip();

    addDirectoryToZip(zip, artifactDir);

    const buffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
      streamFiles: true,
    });

    if (!buffer.length) {
      throw new Error("Generated ZIP package is empty.");
    }

    return new Response(buffer, {
      status: 200,
      headers: zipHeaders(projectId, buffer.length),
    });
  } catch (error) {
    console.error("Runtime artifact download failed:", error);

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create artifact ZIP.",
      },
      { status: 500 }
    );
  }
}
