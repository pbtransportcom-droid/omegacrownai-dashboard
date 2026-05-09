import { NextResponse } from "next/server";
import { OSManifest } from "@/lib/sugent/osManifest";

export function GET() {
  return NextResponse.json({
    ok: true,
    manifest: OSManifest,
  });
}
