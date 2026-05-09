import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  const artifacts = await prisma.browserArtifact.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    ok: true,
    taskId,
    artifacts,
  });
}
