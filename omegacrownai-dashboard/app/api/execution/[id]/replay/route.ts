import { NextResponse } from "next/server";
import { replayExecution } from "@/lib/sugent/secureExecution/replay";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await replayExecution(id);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await replayExecution(id);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
