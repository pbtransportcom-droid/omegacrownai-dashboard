import { NextResponse } from "next/server";
import { getCognitiveMemoryStatus } from "@/lib/sovereign/cognitive-memory/persistentCognitiveMemoryLayer";

export async function GET() {
  return NextResponse.json(getCognitiveMemoryStatus());
}
