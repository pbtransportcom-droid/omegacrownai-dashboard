import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; buildId: string }> }
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id, buildId } = await params;
  const body = await req.json();

  const project = await prisma.project.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!project || project.owner.email !== session.user.email) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const build = await prisma.agentExecution.findFirst({
    where: {
      id: buildId,
      projectId: id,
    },
  });

  if (!build) {
    return NextResponse.json({ ok: false, error: "Build not found" }, { status: 404 });
  }

  const updated = await prisma.agentExecution.update({
    where: { id: buildId },
    data: {
      execution: body.execution || build.execution,
      reply: JSON.stringify(body.execution || build.execution),
    },
  });

  return NextResponse.json({
    ok: true,
    build: updated,
  });
}
