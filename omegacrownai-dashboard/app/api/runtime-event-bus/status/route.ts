import { NextResponse } from "next/server";
import { getRuntimeEventBusStatus } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";

export async function GET() {
  return NextResponse.json(getRuntimeEventBusStatus());
}
