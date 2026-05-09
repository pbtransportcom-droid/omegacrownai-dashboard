import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBuilderPath } from "@/lib/sugent/builder/registry";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";
import { logSugentEvent } from "@/lib/sugent/events/logEvent";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const templateId = String(body.templateId || "");

  if (!templateId) {
    return NextResponse.json(
      { ok: false, error: "templateId is required." },
      { status: 400 }
    );
  }

  const template = await prisma.marketplaceTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    return NextResponse.json(
      { ok: false, error: "Template not found." },
      { status: 404 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    return NextResponse.json(
      { ok: false, error: "Project not found." },
      { status: 404 }
    );
  }

  const build = await prisma.projectBuild.create({
    data: {
      projectId: id,
      label: `Template: ${template.name}`,
      status: "draft",
      source: "marketplace",
      domain: template.domain,
    },
  });

  const artifact = await prisma.projectBuildArtifact.create({
    data: {
      projectId: id,
      buildId: build.id,
      kind: template.draftKind,
      payload: template.draft ?? {},
    },
  });

  await AuditLogger.log({
    projectId: id,
    actorType: "user",
    action: "BUILD_CREATED",
    metadata: {
      source: "marketplace",
      templateId: template.id,
      templateName: template.name,
      buildId: build.id,
      artifactId: artifact.id,
      domain: template.domain,
      draftKind: template.draftKind,
    },
  });

  await logSugentEvent({
    projectId: id,
    buildId: build.id,
    artifactId: artifact.id,
    type: "marketplace_template_installed",
    domain: template.domain,
    actor: "user",
    message: `Installed marketplace template: ${template.name}`,
    payload: {
      templateId: template.id,
      templateName: template.name,
      draftKind: template.draftKind,
    },
  });

  return NextResponse.json({
    ok: true,
    build,
    artifact,
    builderUrl: getBuilderPath(template.domain, id, build.id),
  });
}
