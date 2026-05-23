import { NextResponse } from "next/server";
import { rebalanceRuntimeResources } from "@/lib/resource-allocation/sovereignResourceAllocationEngine";

export async function POST() {
  return NextResponse.json(rebalanceRuntimeResources());
}
