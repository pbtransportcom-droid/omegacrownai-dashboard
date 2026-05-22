import { NextResponse } from "next/server";
import { traverseDependencyGraph } from "@/lib/dependency-graph-engine/autonomousDependencyGraphEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(traverseDependencyGraph(body.graphId));
}
