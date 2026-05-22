import { NextResponse } from "next/server";
import { escalateAutonomousMission } from "@/lib/mission-control/autonomousMissionControl";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(escalateAutonomousMission(body));
}
