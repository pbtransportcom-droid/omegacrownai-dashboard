import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const builds = await prisma.projectBuild.findMany({
    where: {
      projectId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      artifacts: true,
    },
  });

  return NextResponse.json({
    ok: true,
    builds,
  });
}
