import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getWebsiteStarterFiles } from "@/lib/sovereign/website-starter-files";

export async function GET() {
  const starter = getWebsiteStarterFiles();

  const zip = new JSZip();
  const root = zip.folder("sovereign-website-starter");

  if (!root) {
    return NextResponse.json(
      { ok: false, error: "Could not create website starter zip root." },
      { status: 500 }
    );
  }

  for (const file of starter.files) {
    root.file(file.path, file.content);
  }

  const bundle = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  return new NextResponse(bundle, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="sovereign-website-starter.zip"',
      "Cache-Control": "no-store",
      "X-OmegaCrownAI-Artifact": starter.artifactType,
      "X-OmegaCrownAI-File-Count": String(starter.fileCount),
    },
  });
}
