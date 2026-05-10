import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCompanyDepartments } from "@/lib/sugent/company/departments";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const departments = await getCompanyDepartments(companyId);

  return NextResponse.json({
    ok: true,
    companyId,
    departments,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json();

  const slug = String(body.slug || body.name || "department")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const department = await prisma.companyDepartment.create({
    data: {
      companyId,
      name: String(body.name || slug),
      slug,
      purpose: body.purpose ? String(body.purpose) : null,
      status: String(body.status || "active"),
    },
  });

  return NextResponse.json({
    ok: true,
    department,
  });
}
