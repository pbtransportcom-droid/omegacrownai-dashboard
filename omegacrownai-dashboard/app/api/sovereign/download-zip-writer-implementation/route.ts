import { NextResponse } from "next/server";
import { getDownloadZipWriterImplementation } from "@/lib/sovereign/download-zip-writer";

export async function GET() {
  const zipWriter = getDownloadZipWriterImplementation();

  return NextResponse.json({
    ok: true,
    phase: "v24.3 Phase 263",
    service: "Download ZIP Writer Implementation",
    zipWriter,
  });
}
