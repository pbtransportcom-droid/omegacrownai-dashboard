import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; buildId: string }> }
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id, buildId } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!project || project.owner.email !== session.user.email) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  await prisma.publishedSite.deleteMany({
    where: {
      executionId: buildId,
      projectId: id,
      ownerEmail: session.user.email,
    },
  });

  await prisma.agentExecution.deleteMany({
    where: {
      id: buildId,
      projectId: id,
    },
  });

  return NextResponse.json({ ok: true });
}
