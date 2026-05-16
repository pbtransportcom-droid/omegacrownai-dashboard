import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getTradingFileContentArtifact } from "@/lib/sovereign/trading-file-content";

export async function GET() {
  const artifact = getTradingFileContentArtifact();

  const zip = new JSZip();
  const root = zip.folder("saits-v1");

  if (!root) {
    return NextResponse.json(
      {
        ok: false,
        error: "Could not create zip root folder.",
      },
      { status: 500 }
    );
  }

  root.file(
    "SAFETY_NOTICE.txt",
    [
      "SAITS v1.0 is generated in PAPER TRADING ONLY mode.",
      "Live trading is disabled by default.",
      "This is educational scaffolding, not financial advice.",
      "Do not add real broker keys until paper testing, code review, risk review, and manual safety approval are complete.",
      "",
    ].join("\n")
  );

  for (const file of artifact.files) {
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
      "Content-Disposition": 'attachment; filename="saits-v1.zip"',
      "Cache-Control": "no-store",
      "X-OmegaCrownAI-Artifact": artifact.artifactType,
      "X-OmegaCrownAI-Safety-Mode": artifact.safetyMode,
      "X-OmegaCrownAI-Live-Trading-Enabled": String(artifact.liveTradingEnabled),
      "X-OmegaCrownAI-File-Count": String(artifact.fileCount + 1),
    },
  });
}
