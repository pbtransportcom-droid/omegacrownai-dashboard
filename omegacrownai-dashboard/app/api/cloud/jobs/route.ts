import { NextResponse } from "next/server";
import { dispatchCloudJob } from "@/lib/sugent/cloud/dispatcher";
import { runOneCloudJob } from "@/lib/sugent/cloud/worker";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const jobs = await prisma.cloudJob.findMany({
    where: projectId ? { projectId } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    jobs,
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.action === "run_one") {
    const result = await runOneCloudJob();
    return NextResponse.json(result);
  }

  const projectId = String(body.projectId || "");
  const type = String(body.type || "custom");

  if (!projectId) {
    return NextResponse.json(
      { ok: false, error: "projectId is required." },
      { status: 400 }
    );
  }

  const job = await dispatchCloudJob({
    projectId,
    buildId: body.buildId || null,
    type,
    payload: body.payload || {},
  });

  return NextResponse.json({
    ok: true,
    job,
  });
}
