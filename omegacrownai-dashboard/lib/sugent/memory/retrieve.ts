import { prisma } from "@/lib/db";
import { cosine, embed } from "./embedding";

function toNumberArray(value: any): number[] {
  if (Array.isArray(value)) {
    return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
  }

  return [];
}

export const MemoryRetriever = {
  async search({
    query,
    projectId,
    sessionId,
    tags,
    limit = 10,
  }: {
    query: string;
    projectId?: string | null;
    sessionId?: string | null;
    tags?: string[];
    limit?: number;
  }) {
    const qEmbed = await embed(query);

    const records = await prisma.memoryRecord.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(sessionId ? { sessionId } : {}),
        ...(tags?.length ? { tags: { hasSome: tags } } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    });

    const scored = records.map((record) => {
      const recordEmbedding = toNumberArray(record.embedding);
      const similarity = cosine(qEmbed, recordEmbedding);

      return {
        ...record,
        similarity,
        combinedScore: similarity + Number(record.score || 0) * 0.1,
      };
    });

    return scored
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit);
  },
};
