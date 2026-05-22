import { NextResponse } from "next/server";
import { getAutonomousSupervisorStatus } from "@/lib/runtime-supervisor/autonomousSupervisorKernel";

export async function GET() {
  return NextResponse.json(getAutonomousSupervisorStatus());
}
