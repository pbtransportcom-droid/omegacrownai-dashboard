import { NextResponse } from "next/server";
import { getQueueRecoveryStatus } from "@/lib/runtime-recovery/queueRecoveryEngine";

export async function GET() {
  return NextResponse.json(getQueueRecoveryStatus());
}
