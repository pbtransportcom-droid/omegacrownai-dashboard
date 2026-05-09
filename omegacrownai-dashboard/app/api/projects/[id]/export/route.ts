import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildProjectManifest } from "@/lib/sugent/distribution/manifest";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
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

  const manifest = buildProjectManifest({
    project,
    builds,
    artifacts,
  });

  const payload = {
    project: {
      name: project.name,
      ownerId: project.ownerId,
    },
    builds: builds.map((build) => ({
      oldId: build.id,
      label: build.label,
      status: build.status,
      source: build.source,
      domain: build.domain,
      createdAt: build.createdAt,
    })),
    artifacts: artifacts.map((artifact) => ({
      oldId: artifact.id,
      oldBuildId: artifact.buildId,
      kind: artifact.kind,
      payload: artifact.payload ?? {},
      createdAt: artifact.createdAt,
    })),
  };

  const pkg = await prisma.distributionPackage.create({
    data: {
      projectId: id,
      version: "1.0.0",
      type: "project",
      manifest,
      payload,
    },
  });

  await AuditLogger.log({
    projectId: id,
    actorType: "system",
    actorId: "distribution",
    action: "BUILD_CREATED",
    metadata: {
      action: "project_exported",
      packageId: pkg.id,
      builds: builds.length,
      artifacts: artifacts.length,
    },
  });

  return NextResponse.json({
    ok: true,
    package: pkg,
  });
}
