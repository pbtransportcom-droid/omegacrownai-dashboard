import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ExecutionEngine } from "@/lib/sugent/execution/engine";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";
import { dispatchCloudJob } from "@/lib/sugent/cloud/dispatcher";

function cleanSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function artifactKindForBuilder(builderId: string) {
  if (builderId === "trading") return "strategy_draft_v1";
  if (builderId === "automation") return "automation_flow_v1";
  return "website_draft_v1";
}

function publishKindForBuilder(builderId: string) {
  if (builderId === "trading") return "publish_trading";
  if (builderId === "automation") return "publish_automation";
  return "publish_website";
}

function cloudTypeForBuilder(builderId: string) {
  if (builderId === "trading") return "run_strategy";
  if (builderId === "automation") return "run_automation";
  return "deploy_website";
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const executionId = String(body.executionId || "");
    const buildId = String(body.buildId || "");
    const builderId = String(body.builderId || "website");
    const dryRun = Boolean(body.dryRun);
    const slug = cleanSlug(body.slug || "");

    if (!executionId && !buildId) {
      return NextResponse.json(
        { ok: false, error: "Build ID or execution ID is required." },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json({ ok: false, error: "Slug is required." }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!project || project.owner.email !== session.user.email) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    let publishExecutionId = executionId;
    let publishPayload: any = {};

    if (buildId) {
      const build = await prisma.projectBuild.findFirst({
        where: {
          id: buildId,
          projectId: id,
        },
      });

      if (!build) {
        return NextResponse.json({ ok: false, error: "Build not found." }, { status: 404 });
      }

      const artifact = await prisma.projectBuildArtifact.findFirst({
        where: {
          projectId: id,
          buildId,
          kind: artifactKindForBuilder(builderId),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!artifact) {
        return NextResponse.json({ ok: false, error: "Build artifact not found." }, { status: 404 });
      }

      publishPayload = artifact.payload || {};
      publishExecutionId = buildId;

      await ExecutionEngine.validateOnly({
        projectId: id,
        buildId,
        type: publishKindForBuilder(builderId),
        payload: publishPayload,
        actorId: session.user.email,
      });

      if (dryRun) {
        await AuditLogger.log({
          projectId: id,
          actorType: "user",
          actorId: session.user.email,
          action: "SAFETY_CHECKED",
          metadata: {
            dryRun: true,
            buildId,
            builderId,
            slug,
          },
        });

        return NextResponse.json({
          ok: true,
          dryRun: true,
          message: "Dry-run publish passed safety checks.",
        });
      }
    } else {
      const execution = await prisma.agentExecution.findFirst({
        where: {
          id: executionId,
          projectId: id,
        },
      });

      if (!execution) {
        return NextResponse.json({ ok: false, error: "Build not found." }, { status: 404 });
      }

      publishPayload = execution.execution || {};
    }

    let cloudJob: any = null;

    if (buildId) {
      cloudJob = await dispatchCloudJob({
        projectId: id,
        buildId,
        type: cloudTypeForBuilder(builderId),
        payload: publishPayload,
      });
    }

    const published = await prisma.publishedSite.upsert({
      where: { executionId: publishExecutionId },
      update: {
        slug,
        projectId: id,
        ownerEmail: session.user.email,
      },
      create: {
        slug,
        executionId: publishExecutionId,
        projectId: id,
        ownerEmail: session.user.email,
      },
    });

    await AuditLogger.log({
      projectId: id,
      actorType: "user",
      actorId: session.user.email,
      action: "PUBLISHED",
      metadata: {
        executionId: publishExecutionId,
        buildId: buildId || null,
        builderId,
        slug: published.slug,
        cloudJobId: cloudJob?.id || null,
        url: `/site/${published.slug}`,
      },
    });

    return NextResponse.json({
      ok: true,
      published,
      url: `/site/${published.slug}`,
      fullUrl: `https://omegacrownai.com/site/${published.slug}`,
      cloudJob,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Publish failed.",
      },
      { status: 500 }
    );
  }
}
