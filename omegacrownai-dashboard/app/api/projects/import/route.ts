import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  const actor = session?.user?.email || "system";

  const body = await req.json();
  const pkg = body.package || body;
  const manifest = pkg.manifest || {};
  const payload = pkg.payload || {};

  const projectName =
    payload.project?.name ||
    manifest.project?.name ||
    "Imported Sugent Project";

  let ownerId = payload.project?.ownerId || null;

  if (!ownerId && session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    ownerId = user?.id || null;
  }

  if (!ownerId) {
    return NextResponse.json(
      { ok: false, error: "Unable to determine project owner." },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: {
      name: `${projectName} (Imported)`,
      ownerId,
    },
  });

  const buildIdMap = new Map<string, string>();

  for (const build of payload.builds || []) {
    const createdBuild = await prisma.projectBuild.create({
      data: {
        projectId: project.id,
        label: build.label || "Imported build",
        status: build.status || "draft",
        source: build.source || "distribution_import",
        domain: build.domain || "website",
      },
    });

    if (build.oldId) {
      buildIdMap.set(build.oldId, createdBuild.id);
    }
  }

  for (const artifact of payload.artifacts || []) {
    const mappedBuildId = buildIdMap.get(artifact.oldBuildId);

    if (!mappedBuildId) continue;

    await prisma.projectBuildArtifact.create({
      data: {
        projectId: project.id,
        buildId: mappedBuildId,
        kind: artifact.kind || "imported_artifact",
        payload: artifact.payload ?? {},
      },
    });
  }

  await AuditLogger.log({
    projectId: project.id,
    actorType: "user",
    actorId: actor,
    action: "BUILD_CREATED",
    metadata: {
      action: "project_imported",
      sourcePackageId: pkg.id || null,
      sourceProjectId: manifest.project?.id || null,
    },
  });

  return NextResponse.json({
    ok: true,
    project,
    openUrl: `/projects/${project.id}`,
  });
}
