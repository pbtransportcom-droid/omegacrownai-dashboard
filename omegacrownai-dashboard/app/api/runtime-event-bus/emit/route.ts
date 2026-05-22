import { NextResponse } from "next/server";
import { emitRuntimeEvent } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(emitRuntimeEvent(body));
}
