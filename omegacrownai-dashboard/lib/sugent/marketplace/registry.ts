import { prisma } from "@/lib/db";

export const MarketplaceRegistry = {
  async listAgents() {
    return prisma.marketplaceAgent.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });
  },

  async listTools() {
    return prisma.marketplaceTool.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });
  },

  async listTemplates(domain?: string | null) {
    return prisma.marketplaceTemplate.findMany({
      where: {
        status: "active",
        ...(domain ? { domain } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
