import { NextResponse } from "next/server";
import { getRuntimeProjects } from "@/lib/sugent/runtime/pipelineRuntime";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId") || undefined;

  const data = await getRuntimeProjects(companyId);

  return NextResponse.json(data);
}
