import { NextResponse } from "next/server";
import { acceptCustomerTeamInvitation } from "@/lib/sugent/customer-team/customerTeamEngine";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ ok: false, error: "token is required" }, { status: 400 });
  }

  const result = await acceptCustomerTeamInvitation({
    token,
    name: url.searchParams.get("name"),
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.token) {
    return NextResponse.json({ ok: false, error: "token is required" }, { status: 400 });
  }

  const result = await acceptCustomerTeamInvitation({
    token: String(body.token),
    name: body.name ? String(body.name) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
