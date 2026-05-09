import { NextResponse } from "next/server";
import { getCompanyMemory, writeCompanyMemory } from "@/lib/sugent/company/memory";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const memory = await getCompanyMemory(companyId);

  return NextResponse.json({
    ok: true,
    companyId,
    memory,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json();

  const memory = await writeCompanyMemory({
    companyId,
    kind: String(body.kind || "fact"),
    content: String(body.content || ""),
    tags: body.tags || {},
  });

  return NextResponse.json({
    ok: true,
    memory,
  });
}
