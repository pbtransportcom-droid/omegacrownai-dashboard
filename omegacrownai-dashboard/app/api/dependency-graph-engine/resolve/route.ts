import { NextResponse } from "next/server";
import { resolveDependencyGraph } from "@/lib/dependency-graph-engine/autonomousDependencyGraphEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(resolveDependencyGraph(body.graphId));
}
