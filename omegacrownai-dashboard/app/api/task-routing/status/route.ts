import { NextResponse } from "next/server";
import { getTaskRoutingStatus } from "@/lib/task-routing/agentTaskRouter";

export async function GET() {
  return NextResponse.json(getTaskRoutingStatus());
}
