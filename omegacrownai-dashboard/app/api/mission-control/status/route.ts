import { NextResponse } from "next/server";
import { getMissionControlStatus } from "@/lib/mission-control/autonomousMissionControl";

export async function GET() {
  return NextResponse.json(getMissionControlStatus());
}
