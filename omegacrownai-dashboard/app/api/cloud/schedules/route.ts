import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createCloudSchedule } from "@/lib/sugent/cloud/scheduler";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const schedules = await prisma.cloudSchedule.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    schedules,
  });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let body: any = {};

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
      if (typeof body.payload === "string") {
        try {
          body.payload = JSON.parse(body.payload);
        } catch {
          body.payload = { raw: body.payload };
        }
      }
    }

    if (!body.projectId || !body.name) {
      return NextResponse.json(
        {
          ok: false,
          error: "projectId and name are required.",
        },
        { status: 400 }
      );
    }

    const schedule = await createCloudSchedule({
      projectId: String(body.projectId),
      name: String(body.name),
      provider: String(body.provider || "local"),
      type: String(body.type || "generic"),
      payload: body.payload || {},
      intervalMinutes: Number(body.intervalMinutes || 60),
      enabled: String(body.enabled ?? "true") !== "false",
    });

    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL(`/projects/${schedule.projectId}/cloud`, req.url));
    }

    return NextResponse.json({
      ok: true,
      schedule,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to create cloud schedule.",
      },
      { status: 500 }
    );
  }
}
