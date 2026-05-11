import { NextResponse } from "next/server";
import { jobTick } from "@/lib/sugent/reliability/jobRunner";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const result = await jobTick({
    limit: body.limit ? Number(body.limit) : 20,
  });

  return NextResponse.json(result);
}
