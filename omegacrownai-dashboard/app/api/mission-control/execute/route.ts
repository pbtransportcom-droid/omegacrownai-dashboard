import { NextResponse } from "next/server";
import { executeAutonomousMission } from "@/lib/mission-control/autonomousMissionControl";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(executeAutonomousMission(body));
}
