import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      logs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!job) {
    return NextResponse.json(
      { ok: false, error: "JOB_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    job,
  });
}
