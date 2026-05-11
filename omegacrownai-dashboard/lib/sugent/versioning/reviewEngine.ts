import { prisma } from "@/lib/db";

export async function createReviewThread({
  companyId,
  projectId,
  projectType,
  versionId,
  targetType = "project",
  targetId,
  body,
  authorId,
}: {
  companyId: string;
  projectId: string;
  projectType: "video" | "podcast" | "VIDEO" | "PODCAST";
  versionId?: string | null;
  targetType?: "project" | "scene" | "timeline" | "clip" | "PROJECT" | "SCENE" | "TIMELINE" | "CLIP";
  targetId?: string | null;
  body: string;
  authorId?: string | null;
}) {
  const thread = await prisma.reviewThread.create({
    data: {
      companyId,
      projectId,
      projectType: String(projectType).toLowerCase(),
      versionId: versionId || null,
      targetType: String(targetType).toLowerCase(),
      targetId: targetId || null,
      status: "open",
      createdById: authorId || null,
    },
  });

  const comment = await prisma.reviewComment.create({
    data: {
      threadId: thread.id,
      authorId: authorId || null,
      body,
    },
  });

  return {
    ...thread,
    comments: [comment],
  };
}

export async function addReviewComment({
  companyId,
  threadId,
  body,
  authorId,
}: {
  companyId: string;
  threadId: string;
  body: string;
  authorId?: string | null;
}) {
  const thread = await prisma.reviewThread.findFirstOrThrow({
    where: {
      id: threadId,
      companyId,
    },
  });

  return prisma.reviewComment.create({
    data: {
      threadId: thread.id,
      authorId: authorId || null,
      body,
    },
  });
}

export async function resolveReviewThread({
  companyId,
  threadId,
}: {
  companyId: string;
  threadId: string;
}) {
  return prisma.reviewThread.updateMany({
    where: {
      id: threadId,
      companyId,
    },
    data: {
      status: "resolved",
    },
  });
}

export async function listReviewThreads({
  companyId,
  projectId,
  versionId,
}: {
  companyId: string;
  projectId?: string | null;
  versionId?: string | null;
}) {
  return prisma.reviewThread.findMany({
    where: {
      companyId,
      ...(projectId ? { projectId } : {}),
      ...(versionId ? { versionId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
      },
      version: true,
    },
  });
}
