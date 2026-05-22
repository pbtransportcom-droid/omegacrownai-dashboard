import { NextResponse } from "next/server";
import { syncCognitiveMeshPreview } from "@/lib/cognitive-mesh/distributedCognitiveMesh";

export async function POST() {
  return NextResponse.json(syncCognitiveMeshPreview());
}
