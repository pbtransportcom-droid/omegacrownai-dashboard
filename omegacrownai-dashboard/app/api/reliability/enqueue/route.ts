import { NextResponse } from "next/server";
import { enqueueJob } from "@/lib/sugent/reliability/jobRunner";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.type) {
    return NextResponse.json(
      { ok: false, error: "type is required" },
      { status: 400 }
    );
  }

  const job = await enqueueJob({
    companyId: body.companyId ? String(body.companyId) : null,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    type: String(body.type),
    payload: body.payload || {},
    maxAttempts: body.maxAttempts ? Number(body.maxAttempts) : 5,
  });

  return NextResponse.json({
    ok: true,
    job,
  });
}
