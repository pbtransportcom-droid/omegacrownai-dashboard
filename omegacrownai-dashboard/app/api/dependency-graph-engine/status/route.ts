import { NextResponse } from "next/server";
import { getDependencyGraphEngineStatus } from "@/lib/dependency-graph-engine/autonomousDependencyGraphEngine";

export async function GET() {
  return NextResponse.json(getDependencyGraphEngineStatus());
}
