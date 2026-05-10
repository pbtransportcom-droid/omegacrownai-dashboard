import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSupportTicket } from "@/lib/sugent/support/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const tickets = await prisma.supportTicket.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: { responses: true },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    tickets,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const contentType = req.headers.get("content-type") || "";

  let body: any = {};
  if (contentType.includes("application/json")) {
    body = await req.json();
  } else {
    const form = await req.formData();
    body = Object.fromEntries(form.entries());
  }

  const supportDept = await prisma.companyDepartment.findFirst({
    where: { companyId, slug: "support" },
  });

  const result = await createSupportTicket({
    companyId,
    departmentId: supportDept?.id || null,
    customerName: body.customerName ? String(body.customerName) : null,
    customerEmail: body.customerEmail ? String(body.customerEmail) : null,
    subject: String(body.subject || "Support Request"),
    message: String(body.message || ""),
    metadata: body.metadata || {},
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/support`, req.url));
  }

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
