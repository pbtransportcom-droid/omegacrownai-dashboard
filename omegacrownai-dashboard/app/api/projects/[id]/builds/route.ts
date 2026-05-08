import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!project || project.owner.email !== session.user.email) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const builds = await prisma.agentExecution.findMany({
    where: {
      projectId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  const published = await prisma.publishedSite.findMany({
    where: {
      projectId: id,
      ownerEmail: session.user.email,
    },
  });

  return NextResponse.json({
    ok: true,
    builds,
    published,
  });
}
