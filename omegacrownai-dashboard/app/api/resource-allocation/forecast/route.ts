import { NextResponse } from "next/server";
import { forecastResourceCapacity } from "@/lib/resource-allocation/sovereignResourceAllocationEngine";

export async function GET() {
  return NextResponse.json(forecastResourceCapacity());
}
