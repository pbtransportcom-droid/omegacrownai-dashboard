import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const existing = await prisma.cloudJob.findUnique({
    where: { id: jobId },
  });

  if (!existing) {
    return NextResponse.json(
      {
        ok: false,
        error: "Cloud job not found.",
      },
      { status: 404 }
    );
  }

  const retried = await prisma.cloudJob.create({
    data: {
      projectId: existing.projectId,
      buildId: `${existing.buildId || "retry"}-retry`,
      type: existing.type,
      status: "queued",
      payload: {
        ...(existing.payload as any),
        retryOf: existing.id,
        retriedAt: new Date().toISOString(),
      },
      result: Prisma.JsonNull,
    },
  });

  const redirectUrl = new URL(`/projects/${existing.projectId}/cloud/${retried.id}`, req.url);

  if (req.headers.get("accept")?.includes("text/html")) {
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.json({
    ok: true,
    job: retried,
  });
}
