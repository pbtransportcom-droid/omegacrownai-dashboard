import { NextResponse } from "next/server";
import { evaluateResourceQuota } from "@/lib/resource-allocation/sovereignResourceAllocationEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(evaluateResourceQuota(body));
}
