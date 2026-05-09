import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const source = await prisma.project.findUnique({
    where: { id },
  });

  if (!source) {
    return NextResponse.json(
      { ok: false, error: "Project not found." },
      { status: 404 }
    );
  }

  const [builds, artifacts] = await Promise.all([
    prisma.projectBuild.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.projectBuildArtifact.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const clone = await prisma.project.create({
    data: {
      name: `${source.name} (Clone)`,
      ownerId: source.ownerId,
    },
  });

  const buildIdMap = new Map<string, string>();

  for (const build of builds) {
    const clonedBuild = await prisma.projectBuild.create({
      data: {
        projectId: clone.id,
        label: build.label,
        status: build.status,
        source: "clone",
        domain: build.domain,
      },
    });

    buildIdMap.set(build.id, clonedBuild.id);
  }

  for (const artifact of artifacts) {
    const mappedBuildId = buildIdMap.get(artifact.buildId);

    if (!mappedBuildId) continue;

    await prisma.projectBuildArtifact.create({
      data: {
        projectId: clone.id,
        buildId: mappedBuildId,
        kind: artifact.kind,
        payload: artifact.payload ?? {},
      },
    });
  }

  await AuditLogger.log({
    projectId: clone.id,
    actorType: "system",
    actorId: "distribution",
    action: "BUILD_CREATED",
    metadata: {
      action: "project_cloned",
      sourceProjectId: id,
      builds: builds.length,
      artifacts: artifacts.length,
    },
  });

  return NextResponse.json({
    ok: true,
    project: clone,
    openUrl: `/projects/${clone.id}`,
  });
}
