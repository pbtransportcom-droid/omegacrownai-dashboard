import { prisma } from "@/lib/db";

export const MemoryMaintenance = {
  async pruneLowScore(threshold = 0.05) {
    return prisma.memoryRecord.deleteMany({
      where: {
        score: {
          lt: threshold,
        },
      },
    });
  },

  async decay(factor = 0.95) {
    const records = await prisma.memoryRecord.findMany({
      take: 1000,
      orderBy: {
        createdAt: "asc",
      },
    });

    for (const record of records) {
      await prisma.memoryRecord.update({
        where: { id: record.id },
        data: {
          score: Number(record.score || 0) * factor,
        },
      });
    }

    return {
      ok: true,
      updated: records.length,
      factor,
    };
  },
};
