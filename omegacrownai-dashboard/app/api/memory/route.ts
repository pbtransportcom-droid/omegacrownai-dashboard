import { NextResponse } from "next/server";
import { MemoryWriter } from "@/lib/sugent/memory/write";
import { MemoryRetriever } from "@/lib/sugent/memory/retrieve";
import { MemoryMaintenance } from "@/lib/sugent/memory/maintenance";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get("q") || "";
  const projectId = searchParams.get("projectId");
  const sessionId = searchParams.get("sessionId");
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];

  if (!query) {
    return NextResponse.json(
      { ok: false, error: "q is required." },
      { status: 400 }
    );
  }

  const memories = await MemoryRetriever.search({
    query,
    projectId,
    sessionId,
    tags,
  });

  return NextResponse.json({
    ok: true,
    memories,
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.action === "decay") {
    const result = await MemoryMaintenance.decay(Number(body.factor || 0.95));
    return NextResponse.json(result);
  }

  if (body.action === "prune") {
    const result = await MemoryMaintenance.pruneLowScore(Number(body.threshold || 0.05));
    return NextResponse.json({ ok: true, result });
  }

  const memory = await MemoryWriter.write({
    projectId: body.projectId || null,
    sessionId: body.sessionId || null,
    type: String(body.type || "user"),
    content: String(body.content || ""),
    tags: Array.isArray(body.tags) ? body.tags : [],
    score: Number(body.score ?? 0.5),
  });

  return NextResponse.json({
    ok: true,
    memory,
  });
}
