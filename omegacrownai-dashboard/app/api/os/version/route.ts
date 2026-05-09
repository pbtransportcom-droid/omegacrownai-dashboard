import { NextResponse } from "next/server";
import { SugentVersion, getSugentVersionString } from "@/lib/sugent/version";

export function GET() {
  return NextResponse.json({
    ok: true,
    version: SugentVersion,
    versionString: getSugentVersionString(),
  });
}
