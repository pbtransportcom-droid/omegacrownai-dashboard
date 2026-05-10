import { NextResponse } from "next/server";
import { getExecutiveCommandCenter } from "@/lib/sugent/executive/commandCenter";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getExecutiveCommandCenter(id);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
