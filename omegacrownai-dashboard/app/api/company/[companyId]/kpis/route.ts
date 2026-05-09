import { NextResponse } from "next/server";
import { getCompanyKpiSnapshot, setCompanyKPI } from "@/lib/sugent/company/kpi";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const kpis = await getCompanyKpiSnapshot(companyId);

  return NextResponse.json({
    ok: true,
    companyId,
    kpis,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json();

  const kpi = await setCompanyKPI({
    companyId,
    metric: String(body.metric || "metric"),
    value: Number(body.value || 0),
    period: String(body.period || "week"),
    note: body.note ? String(body.note) : null,
  });

  return NextResponse.json({
    ok: true,
    kpi,
  });
}
