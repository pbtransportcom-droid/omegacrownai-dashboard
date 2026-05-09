import { prisma } from "@/lib/db";
import { embed } from "./embedding";

export type MemoryWriteInput = {
  projectId?: string | null;
  sessionId?: string | null;
  type: "agent" | "builder" | "cloud" | "user" | "system" | string;
  content: string;
  tags?: string[];
  score?: number;
};

export const MemoryWriter = {
  async write(input: MemoryWriteInput) {
    const content = String(input.content || "").trim();

    if (!content) {
      return null;
    }

    const embedding = await embed(content);

    return prisma.memoryRecord.create({
      data: {
        projectId: input.projectId || null,
        sessionId: input.sessionId || null,
        type: input.type,
        content,
        embedding,
        tags: input.tags || [],
        score: input.score ?? 0.5,
      },
    });
  },
};
