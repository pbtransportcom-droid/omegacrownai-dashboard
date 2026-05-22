import { NextResponse } from "next/server";
import { dispatchTask } from "@/lib/task-routing/agentTaskRouter";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(dispatchTask(body));
}
