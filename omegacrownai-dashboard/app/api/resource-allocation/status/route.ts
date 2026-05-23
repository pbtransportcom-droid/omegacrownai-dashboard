import { NextResponse } from "next/server";
import { getResourceAllocationStatus } from "@/lib/resource-allocation/sovereignResourceAllocationEngine";

export async function GET() {
  return NextResponse.json(getResourceAllocationStatus());
}
