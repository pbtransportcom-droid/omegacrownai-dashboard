import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db";

function cleanSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const executionId = String(body.executionId || "");
  const slug = cleanSlug(body.slug || "");

  if (!executionId) {
    return NextResponse.json({ ok: false, error: "Build ID is required." }, { status: 400 });
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

  const execution = await prisma.agentExecution.findFirst({
    where: {
      id: executionId,
      projectId: id,
    },
  });

  if (!execution) {
    return NextResponse.json({ ok: false, error: "Build not found." }, { status: 404 });
  }

  const published = await prisma.publishedSite.upsert({
    where: { executionId },
    update: {
      slug,
      projectId: id,
      ownerEmail: session.user.email,
    },
    create: {
      slug,
      executionId,
      projectId: id,
      ownerEmail: session.user.email,
    },
  });

  return NextResponse.json({
    ok: true,
    published,
    url: `/site/${published.slug}`,
    fullUrl: `https://omegacrownai.com/site/${published.slug}`,
  });
}
