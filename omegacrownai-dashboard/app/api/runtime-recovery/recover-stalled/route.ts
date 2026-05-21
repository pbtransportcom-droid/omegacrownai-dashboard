import { NextResponse } from "next/server";
import { recoverStalledRuntimeItems } from "@/lib/runtime-recovery/queueRecoveryEngine";

export async function POST() {
  return NextResponse.json(recoverStalledRuntimeItems());
}
