import { NextResponse } from "next/server";
import { runCognitiveMeshConsensusPreview } from "@/lib/cognitive-mesh/distributedCognitiveMesh";

export async function POST() {
  return NextResponse.json(runCognitiveMeshConsensusPreview());
}
