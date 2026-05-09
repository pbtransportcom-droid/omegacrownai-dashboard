import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; buildId: string }> }
) {
  const { id, buildId } = await params;

  const build = await prisma.projectBuild.findFirst({
    where: {
      id: buildId,
      projectId: id,
    },
  });

  if (!build) {
    return NextResponse.json({ ok: false, error: "Build not found" }, { status: 404 });
  }

  const artifact = await prisma.projectBuildArtifact.findFirst({
    where: {
      projectId: id,
      buildId,
    },
  });

  return NextResponse.json({
    ok: true,
    build,
    artifact,
    draft: artifact?.payload || null,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; buildId: string }> }
) {
  const { id, buildId } = await params;

  await prisma.projectBuildArtifact.deleteMany({
    where: {
      projectId: id,
      buildId,
    },
  });

  await prisma.projectBuild.deleteMany({
    where: {
      id: buildId,
      projectId: id,
    },
  });

  return NextResponse.json({ ok: true });
}
