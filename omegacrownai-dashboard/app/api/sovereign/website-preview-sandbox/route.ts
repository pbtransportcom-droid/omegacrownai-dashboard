import { NextResponse } from "next/server";
import { getWebsitePreviewSandbox } from "@/lib/sovereign/website-preview-sandbox";

export async function GET() {
  const preview = getWebsitePreviewSandbox();

  return NextResponse.json({
    ok: true,
    phase: "v23.4 Phase 254",
    service: "Website Preview Sandbox",
    preview,
  });
}
