import { prisma } from "@/lib/db";

export async function writeCompanyMemory({
  companyId,
  kind = "fact",
  content,
  tags = {},
}: {
  companyId: string;
  kind?: string;
  content: string;
  tags?: any;
}) {
  return prisma.companyMemory.create({
    data: {
      companyId,
      kind,
      content,
      tags,
    },
  });
}

export async function getCompanyMemory(companyId: string, limit = 50) {
  return prisma.companyMemory.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
