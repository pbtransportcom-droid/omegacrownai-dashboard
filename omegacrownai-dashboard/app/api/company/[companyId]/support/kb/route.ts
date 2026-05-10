import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createKnowledgeArticle } from "@/lib/sugent/support/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const articles = await prisma.supportKnowledgeBase.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    articles,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json();

  const supportDept = await prisma.companyDepartment.findFirst({
    where: { companyId, slug: "support" },
  });

  const article = await createKnowledgeArticle({
    companyId,
    departmentId: supportDept?.id || null,
    subject: String(body.subject || body.title || "Support Article"),
    category: String(body.category || "general"),
  });

  return NextResponse.json({
    ok: true,
    article,
  });
}
