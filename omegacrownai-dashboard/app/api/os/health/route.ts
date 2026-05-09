import { NextResponse } from "next/server";
import { getSugentVersionString } from "@/lib/sugent/version";

export function GET() {
  return NextResponse.json({
    ok: true,
    status: "healthy",
    version: getSugentVersionString(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
