import { NextResponse } from "next/server";
import { seedDefaultDepartments } from "@/lib/sugent/company/departments";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const departments = await seedDefaultDepartments(companyId);

  return NextResponse.json({
    ok: true,
    companyId,
    departments,
  });
}
