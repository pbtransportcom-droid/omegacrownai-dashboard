import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDefaultWorkers } from "@/lib/sugent/company/orchestrator";
import { seedDefaultDepartments } from "@/lib/sugent/company/departments";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const companies = await prisma.company.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companies,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.projectId || !body.name) {
      return NextResponse.json(
        {
          ok: false,
          error: "projectId and name are required.",
        },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        projectId: String(body.projectId),
        name: String(body.name),
        mission: body.mission ? String(body.mission) : null,
        vision: body.vision ? String(body.vision) : null,
        idealCustomerProfile: body.idealCustomerProfile || body.icp || null,
        primaryOffer: body.primaryOffer || body.offer || null,
        channels: body.channels || null,
        status: body.status || "active",
      },
    });

    await seedDefaultWorkers(company.id);
    await seedDefaultDepartments(company.id);

    return NextResponse.json({
      ok: true,
      company,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to create company.",
      },
      { status: 500 }
    );
  }
}
