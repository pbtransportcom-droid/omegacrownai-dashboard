import { NextResponse } from "next/server";
import { createMarketingLead } from "@/lib/sugent/marketing/publicMarketingEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.email) {
    return NextResponse.json({ ok: false, error: "email is required" }, { status: 400 });
  }

  const result = await createMarketingLead({
    email: String(body.email),
    name: body.name ? String(body.name) : null,
    companyName: body.companyName ? String(body.companyName) : null,
    phone: body.phone ? String(body.phone) : null,
    source: body.source ? String(body.source) : "pricing",
    interest: body.interest ? String(body.interest) : null,
    planInterest: body.planInterest ? String(body.planInterest) : null,
    message: body.message ? String(body.message) : null,
    metadata: body.metadata || {},
  });

  return NextResponse.json(result);
}
