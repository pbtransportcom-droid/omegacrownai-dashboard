import { NextResponse } from "next/server";
import { interveneInRuntimeIssue } from "@/lib/runtime-supervisor/autonomousSupervisorKernel";

export async function POST() {
  return NextResponse.json(interveneInRuntimeIssue());
}
