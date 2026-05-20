import { prisma } from "@/lib/db";

export async function getProjectSafetySettings(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    return null;
  }

  const existing = await prisma.projectSafetySettings.findUnique({
    where: { projectId },
  });

  if (existing) {
    return existing;
  }

  return prisma.projectSafetySettings.create({
    data: {
      projectId,
      tradingMaxLeverage: 5,
      automationAllowExternal: false,
      websiteAllowCustomScripts: false,
      requireReviewBeforePublish: true,
    },
  });
}
