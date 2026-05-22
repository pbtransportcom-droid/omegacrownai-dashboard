import { NextResponse } from "next/server";
import { recordCognitiveMemoryPreview } from "@/lib/sovereign/cognitive-memory/persistentCognitiveMemoryLayer";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(recordCognitiveMemoryPreview(body));
}
