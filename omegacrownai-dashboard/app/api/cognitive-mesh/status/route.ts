import { NextResponse } from "next/server";
import { getDistributedCognitiveMeshStatus } from "@/lib/cognitive-mesh/distributedCognitiveMesh";

export async function GET() {
  return NextResponse.json(getDistributedCognitiveMeshStatus());
}
