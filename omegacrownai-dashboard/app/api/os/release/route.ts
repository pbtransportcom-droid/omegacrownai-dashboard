import { NextResponse } from "next/server";
import { CurrentRelease, ReleaseChannels } from "@/lib/sugent/release";

export function GET() {
  return NextResponse.json({
    ok: true,
    current: CurrentRelease,
    channels: ReleaseChannels,
  });
}
