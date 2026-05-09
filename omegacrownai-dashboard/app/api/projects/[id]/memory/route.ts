import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MemoryWriter } from "@/lib/sugent/memory/write";
import { MemoryRetriever } from "@/lib/sugent/memory/retrieve";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (q) {
    const memories = await MemoryRetriever.search({
      query: q,
      projectId: id,
    });

    return NextResponse.json({
      ok: true,
      memories,
      mode: "search",
    });
  }

  const memories = await prisma.memoryRecord.findMany({
    where: {
      projectId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    memories,
    mode: "list",
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const memory = await MemoryWriter.write({
    projectId: id,
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
